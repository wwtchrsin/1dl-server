import * as miscs from "../../lib/database/miscs"
import * as conn from "../../lib/database/conn"
import { deleteExpiredMessages } from "../../worker-tasks"
import { sql } from "../../lib/database/schema"
import { populateDatabase, messageTimestampMin, messageTimestampMax,
  databaseMessages } from "../../lib/test-data"
import * as redisConn from "../../lib/redis/conn"
import { getReports } from "../../lib/redis/tests"
import env from "../../lib/env"

beforeAll(async () => {
  if ( conn.schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await conn.pool.query(`CREATE SCHEMA IF NOT EXISTS ${conn.schema}`)
  await conn.pool.query(sql.resetTables)
  await conn.pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
  await conn.pool.query(`DROP SCHEMA ${conn.schema} CASCADE`)
  await conn.pool.end()
})

let deleteNoneTimestamp = () => messageTimestampMin + env.lifetime.message - 1
let deleteOneTimestamp = () => messageTimestampMin + env.lifetime.message
let deleteAllTimestamp = () => messageTimestampMax + env.lifetime.message

let rowCount = databaseMessages.length

describe("testing worker tasks...", () => {
  afterEach(async () => {
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    mocks: {
      getTimestamp: deleteAllTimestamp,
      queryDatabase: () => Promise.resolve(undefined)
    },
    expres: false,
    deletedRows: 0,
  }, {
    tag: 2,
    mocks: {
      getTimestamp: deleteNoneTimestamp,
    },
    expres: true,
    deletedRows: 0,
  }, {
    tag: 3,
    mocks: {
      getTimestamp: deleteOneTimestamp,
    },
    expres: true,
    deletedRows: 1,
  }, {
    tag: 4,
    mocks: {
      getTimestamp: deleteAllTimestamp,
    },
    expres: true,
    deletedRows: databaseMessages.length - 1,
  }, {
    tag: 5,
    mocks: {
      getTimestamp: deleteAllTimestamp,
    },
    expres: true,
    deletedRows: 0,
  }]
  for ( let testcase of testcases ) {
    let { mocks, expres, deletedRows, tag } = testcase
    test(`Task deleteExpiredMessages. Test #${tag}`, async () => {
      let reportsPromise = getReports("messages:deleted", 1)
      jest.spyOn(miscs, "getTimestamp").mockImplementation(mocks.getTimestamp)
      if ( mocks.queryDatabase ) {
        jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      }
      let result = await deleteExpiredMessages()
      jest.restoreAllMocks()
      expect(result).toBe(expres)
      rowCount -= deletedRows
      let messages = await conn.queryDatabase("SELECT * FROM messages")
      expect(messages).toBeDefined()
      expect(messages.rows).toHaveLength(rowCount)
      let reports = await reportsPromise
      if ( deletedRows > 0 ) {
        expect(reports).toHaveLength(1)
        expect(reports[0].messageids).toBeDefined()
        expect(reports[0].messageids).toHaveLength(deletedRows)
        for ( let i=0; i < deletedRows; i++ ) {
          expect(reports[0].messageids[i].region).toBeDefined()
          expect(reports[0].messageids[i].tag).toBeDefined()
          expect(reports[0].messageids[i].index).toBeDefined()
        }
      } else { 
        expect(reports).toHaveLength(0)
      }
    })
  }
})

