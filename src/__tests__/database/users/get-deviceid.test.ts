import { pool, schema } from "../../../lib/database/conn"
import { getDeviceid } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions } 
  from "../../../lib/test-data"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: databaseSessions[0].userid,
    expres: {
      error: undefined,
      data: databaseSessions[0].deviceid,
    },
  }, {
    tag: 2,
    args: databaseSessions[2].userid,
    expres: {
      error: undefined,
      data: databaseSessions[2].deviceid,
    },
  }, {
    tag: 3,
    args: examples.uuid[0],
    expres: {
      error: "databaseConflict.sessionNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "databaseError.getDeviceid",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getDeviceid. Test #${tag}`, async () => {
      let result = await getDeviceid(args)
      expect(result).toStrictEqual(expres)
    })
  }
})


