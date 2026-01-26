import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import * as messages from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, districtMsgcounts } from "../../../lib/test-data"
import * as redisConn from "../../../lib/redis/conn"
import * as redisCache from "../../../lib/redis/cache"
import { clearRedis, initRedisCache } from "../../../lib/redis/tests"
import { getReports } from "../../../lib/redis/tests"

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
  afterEach(async () => {
    jest.restoreAllMocks()
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
  })
  let testcases = [{
    tag: 1,
    args: limits.message.region.values[0],
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
      msgcounts: msgcounts(limits.message.region.values[0]),
    },
  }, {
    tag: 2,
    args: limits.message.region.values[0],
    mocks: {},
    calls: {
      countRegionMessages: 0,
      updateDistrictMsgcounts: 0,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(limits.message.region.values[0]),
    },
  }, {
    tag: 3,
    args: limits.message.region.values[1],
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
      msgcounts: msgcounts(limits.message.region.values[1]),
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
      error: "wrongValue.message.region",
      msgcounts: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, calls, expres, tag } = testcase
    test(`GET /messages/region. Test #${tag}`, async () => {
      let reportsPromise = getReports("msgcounts:districts", calls.updateDistrictMsgcounts)
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
        expect(result.body.msgcounts).toStrictEqual(expres.msgcounts)
      } else {
        expect(result.body.error).toStrictEqual(expres.error)
        expect(result.body.msgcounts).toBeUndefined()
      }
      expect(countRegionMessages).toHaveBeenCalledTimes(calls.countRegionMessages)
      expect(updateDistrictMsgcounts).toHaveBeenCalledTimes(calls.updateDistrictMsgcounts)
      let reports = await reportsPromise
      expect(reports).toHaveLength(calls.updateDistrictMsgcounts)
      if ( calls.updateDistrictMsgcounts === 1 ) {
        expect(reports[0].region).toBeDefined()
        expect(reports[0].region).toBe(args)
        expect(reports[0].msgcounts).toBeDefined()
        expect(reports[0].msgcounts).toStrictEqual(expres.msgcounts)
      }
    })
  }
})

