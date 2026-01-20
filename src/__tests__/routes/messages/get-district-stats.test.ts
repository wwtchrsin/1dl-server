import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import * as messages from "../../../lib/database/messages"
import { populateDatabase, databaseDistricts, databaseEmptyDistricts,
  roomMsgcounts } from "../../../lib/test-data"
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

let msgcounts = (districtid: any) => {
  let { region, district } = districtid
  return roomMsgcounts[region][district]
}

let cacheEmpty = () => Promise.resolve({ error: false, data: undefined })

describe("testing endpoints...", () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
  })
  let testcases = [{
    tag: 1,
    args: databaseDistricts[0],
    mocks: {
      getRoomMsgcounts: cacheEmpty,
    },
    calls: {
      countDistrictMessages: 1,
      updateRoomMsgcounts: 1,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(databaseDistricts[0]),
    },
  }, {
    tag: 2,
    args: databaseDistricts[0],
    mocks: {},
    calls: {
      countDistrictMessages: 0,
      updateRoomMsgcounts: 0,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(databaseDistricts[0]),
    },
  }, {
    tag: 3,
    args: databaseDistricts[1],
    mocks: {
      getRoomMsgcounts: cacheEmpty,
    },
    calls: {
      countDistrictMessages: 1,
      updateRoomMsgcounts: 1,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: msgcounts(databaseDistricts[1]),
    },
  }, {
    tag: 4,
    args: databaseEmptyDistricts[2],
    mocks: {
      getRoomMsgcounts: cacheEmpty,
    },
    calls: {
      countDistrictMessages: 1,
      updateRoomMsgcounts: 1,
    },
    expres: {
      status: 200,
      error: undefined,
      msgcounts: {},
    },
  }, {
    tag: 5,
    args: {
      region: "abcd",
      district: databaseDistricts[0].district,
    },
    mocks: {
      getRoomMsgcounts: cacheEmpty,
    },
    calls: {
      countDistrictMessages: 0,
      updateRoomMsgcounts: 0,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      msgcounts: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, calls, expres, tag } = testcase
    test(`GET /messages/region/district. Test #${tag}`, async () => {
      let reportsPromise = getReports("msgcounts:rooms", calls.updateRoomMsgcounts)
      if ( mocks.getRoomMsgcounts ) {
        jest.spyOn(redisCache, "getRoomMsgcounts")
          .mockImplementation(mocks.getRoomMsgcounts)
      }
      let countDistrictMessages = jest.spyOn(messages, "countDistrictMessages")
      let updateRoomMsgcounts = jest.spyOn(redisCache, "updateRoomMsgcounts")
      let { region, district } = args
      let url = `/api/v1/messages/${region}/${district}`
      let result = await testServer.get(url)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.msgcounts).toStrictEqual(expres.msgcounts)
      } else {
        expect(result.body.error).toBe(expres.error)
        expect(result.body.msgcounts).toBeUndefined()
      }
      expect(countDistrictMessages).toHaveBeenCalledTimes(calls.countDistrictMessages)
      expect(updateRoomMsgcounts).toHaveBeenCalledTimes(calls.updateRoomMsgcounts)
      let reports = await reportsPromise
      expect(reports).toHaveLength(calls.updateRoomMsgcounts)
      if ( calls.updateRoomMsgcounts === 1 ) {
        expect(reports[0].districtid).toBeDefined()
        expect(reports[0].districtid.region).toBe(region)
        expect(`${reports[0].districtid.district}`).toBe(`${district}`)
        expect(reports[0].msgcounts).toBeDefined()
        expect(reports[0].msgcounts).toStrictEqual(expres.msgcounts)
      }
    })
  }
})

