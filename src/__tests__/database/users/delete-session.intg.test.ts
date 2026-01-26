import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { deleteSession } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"

beforeAll(async () => {
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
    expres: undefined,
    rowCount: databaseSessions.length - 1,
  }, {
    tag: 2,
    args: databaseSessions[2].userid,
    expres: undefined,
    rowCount: databaseSessions.length - 2,
  }, {
    tag: 3,
    args: databaseSessions[0].userid,
    expres: "databaseConflict.sessionNotFound",
    rowCount: databaseSessions.length - 2,
  }, {
    tag: 4,
    args: examples.uuid[0],
    expres: "databaseConflict.sessionNotFound",
    rowCount: databaseSessions.length - 2,
  }, {
    tag: 5,
    args: "abcd",
    expres: "databaseError.deleteSession",
    rowCount: databaseSessions.length - 2,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, rowCount, tag } = testcase
    test(`Function deleteSession. Intg Test #${tag}`, async () => {
      let result = await deleteSession(args)
      expect(result).toBe(expres)
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})

      
    
    
