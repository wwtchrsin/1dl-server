import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { deleteMessagesByTime } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { populateDatabase, messageTimestampMin, 
  messageTimestampMax, databaseMessages } from "../../../lib/test-data"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: messageTimestampMin - 1,
    expres: {
      error: undefined,
      dataLength: 0,
    },
    rowCount: databaseMessages.length,
  }, {
    tag: 2,
    args: messageTimestampMin,
    expres: {
      error: undefined,
      dataLength: 1,
    },
    rowCount: databaseMessages.length - 1,
  }, {
    tag: 3,
    args: messageTimestampMin,
    expres: {
      error: undefined,
      dataLength: 0,
    },
    rowCount: databaseMessages.length - 1,
  }, {
    tag: 4,
    args: messageTimestampMax - 1,
    expres: {
      error: undefined,
      dataLength: databaseMessages.length - 2,
    },
    rowCount: 1,
  }, {
    tag: 5,
    args: messageTimestampMax,
    expres: {
      error: undefined,
      dataLength: 1,
    },
    rowCount: 0,
  }, {
    tag: 6,
    args: messageTimestampMax,
    expres: {
      error: undefined,
      dataLength: 0,
    },
    rowCount: 0,
  }, {
    tag: 7,
    args: "abcd",
    expres: {
      error: "databaseError.deleteMessagesByTime",
      dataLength: undefined,
    },
    rowCount: 0,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, rowCount, tag } = testcase
    test(`Function deleteMessagesByTime. Test #${tag}`, async () => {
      let result = await deleteMessagesByTime(args as number)
      if ( !expres.error ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data).toHaveLength(expres.dataLength)
        for ( let i=0; i < result.data.length; i++ ) {
          expect(result.data[i].region).toMatch(patterns.region)
          expect(result.data[i].tag).toMatch(patterns.tag)
          expect(result.data[i].index).toBeGreaterThanOrEqual(limits.message.index.min)
          expect(result.data[i].index).toBeLessThanOrEqual(limits.message.index.max)
        }
      } else {
        expect(result.error).toBe(expres.error)
        expect(result.data).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM messages")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})

    
      
    



