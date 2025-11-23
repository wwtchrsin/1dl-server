process.env.PG_SCHEMA = "createSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createSession } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"



beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let uuids = [
  "53e291f8-522b-43b8-a5f5-84795b887a81",
  "c656b2b6-5008-46d6-b407-92a050476048",
]

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    calls: [{
      args: uuids[0],
      expres: "success",
    }],
    exprows: 1,
  }, {
    tag: 2,
    calls: [{
      args: uuids[0],
      expres: "success",
    }, {
      args: uuids[1],
      expres: "success",
    }],
    exprows: 2,
  }, {
    tag: 3,
    calls: [{
      args: uuids[0],
      expres: "success",
    }, {
      args: uuids[0],
      expres: "success",
    }],
    exprows: 1,
  }, {
    tag: 4,
    calls: [{
      args: "abcd",
      expres: wrongValues.users.userid,
    }],
    exprows: 0,
  }, {
    tag: 5,
    calls: [{
      args: "abcd",
      expres: wrongValues.users.userid,
    }, {
      args: uuids[0],
      expres: "success",
    }],
    exprows: 1,
  }]
  for ( let testcase of testcases ) {
    let { calls, exprows, tag } = testcase
    test(`Function createSession. Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await createSession(args)
        if ( expres === "success" ) {
          expect(result.error).toBeUndefined()
          expect(result.data).toMatch(limits.patterns.uuid)
          continue
        }
        expect(result.error).toStrictEqual(expres)
        expect(result.data).toBeUndefined()
      }
      let result = await queryDatabase("SELECT * FROM sessions")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(exprows)
      for ( let i=0; i < exprows; i++ ) {
        expect(result.rows[i].userid).toMatch(limits.patterns.uuid)
        expect(result.rows[i].sessionid).toMatch(limits.patterns.uuid)
        expect(result.rows[i].timestamp).toMatch(limits.patterns.timestamp)
      }
    })
  }
})
    

