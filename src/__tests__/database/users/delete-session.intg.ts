process.env.PG_SCHEMA = "deleteSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { deleteSession, createSession } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let userids = [
  "53e291f8-522b-43b8-a5f5-84795b887a81",
  "c656b2b6-5008-46d6-b407-92a050476048",
]

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    init: [userids[0]],
    args: userids[0],
    expres: "success",
  }, {
    tag: 2,
    init: [userids[0]],
    args: "abcd",
    expres: "wrongValues.users.userid",
  }, {
    tag: 3,
    init: [userids[0]],
    args: userids[1],
    expres: "databaseConflicts.sessionNotFound",
  }]
  for ( let testcase of testcases ) {
    let { init, args, expres, tag } = testcase
    test(`Function deleteSession. Intg Test #${tag}`, async () => {
      let sessionids = new Map<string, string>()    
      for ( let userid of init ) {
        let result = await createSession(userid)
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
        sessionids.set(userid, result.data)
      }
      let result = await deleteSession(args)
      let rowCount = init.length
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
        expect(result.data).toBe(sessionids.get(args))
        rowCount--
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
      for ( let i=0; i < rowCount; i++ ) {
        expect(table.rows[i].userid).toMatch(limits.patterns.uuid)
        expect(table.rows[i].sessionid).toMatch(limits.patterns.uuid)
        expect(table.rows[i].timestamp).toMatch(limits.patterns.timestamp)
      }
    })
  }
})

      
    
    
