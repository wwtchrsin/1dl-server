import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { processDistrictMsgcounts as process } from "../../../lib/database/miscs"
import * as messages from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { populateDatabase, districtMsgcounts } 
  from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"
import env from "../../../lib/env"
import * as redisConn from "../../../lib/redis/conn"
import * as redisCache from "../../../lib/redis/cache"
import { clearRedis, initRedisCache } from "../../../lib/redis/tests"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
  await initRedisCache()
})

afterAll(async () => {
  await clearRedis()
  await redisConn.closeConns()
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let msgcounts = (region: string) => districtMsgcounts[region]

let cacheEmpty = () => Promise.resolve({ error: false, data: undefined })

describe("testing endpoints...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: limits.messages.regions[0],
    mocks: {
      getDistrictMsgcounts: cacheEmpty,
    },
    calls: {
      countRegionMessages: 1,
      updateDistrictMsgcounts: 1,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(limits.messages.regions[0]),
    },
  }, {
    tag: 2,
    args: limits.messages.regions[0],
    mocks: {},
    calls: {
      countRegionMessages: 0,
      updateDistrictMsgcounts: 0,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(limits.messages.regions[0]),
    },
  }, {
    tag: 3,
    args: limits.messages.regions[1],
    mocks: {
      getDistrictMsgcounts: cacheEmpty,
    },
    calls: {
      countRegionMessages: 1,
      updateDistrictMsgcounts: 1,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(limits.messages.regions[1]),
    },
  }, {
    tag: 4,
    args: "abcd",
    mocks: {
      getDistrictMsgcounts: cacheEmpty,
    },
    calls: {
      countRegionMessages: 0,
      updateDistrictMsgcounts: 0,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      msgcounts: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, calls, expres, tag } = testcase
    test(`GET /messages/region. Test #${tag}`, async () => {
      if ( mocks.getDistrictMsgcounts ) {
        jest.spyOn(redisCache, "getDistrictMsgcounts")
          .mockImplementation(mocks.getDistrictMsgcounts)
      }
      let countRegionMessages = jest.spyOn(messages, "countRegionMessages")
      let updateDistrictMsgcounts = jest.spyOn(redisCache, "updateDistrictMsgcounts")
      let result = await testServer.get(`/api/v1/messages/${args}`)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.districts).toStrictEqual(expres.districts)
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.districts).toBeUndefined()
      }
      expect(countRegionMessages).toHaveBeenCalledTimes(calls.countRegionMessages)
      expect(updateDistrictMsgcounts).toHaveBeenCalledTimes(calls.updateDistrictMsgcounts)
    })
  }
})

