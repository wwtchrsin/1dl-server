import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { createSession } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseUsers } 
  from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    args: {
      userid: databaseUsers[0].userid,
      identifier: examples.sessionid[0],
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      userid: databaseUsers[2].userid,
      identifier: examples.sessionid[2],
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      userid: "abcd",
      identifier: examples.sessionid[2],
    },
    expres: "databaseError.deleteSession",
  }, {
    tag: 4,
    args: {
      userid: databaseUsers[2].userid,
      identifier: "abcd",
    },
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Intg Test #${tag}`, async () => {
      let result = await createSession(args.userid, args.identifier)
      let rowCount = 0
      if ( expres === undefined ) {     
        expect(result.error).toBeUndefined()
        expect(result.sessionid).toMatch(patterns.sessionid)
        rowCount++
      } else {
        expect(result.error).toBe(expres)
        expect(result.sessionid).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
  test("Function createSession. Intg Test #8", async () => {
    let args1 = {
      userid: databaseUsers[0].userid,
      identifier: examples.sessionid[0],
    }
    let args2 = {
      userid: databaseUsers[1].userid,
      identifier: examples.sessionid[1],
    }
    let resultA = await createSession(args1.userid, args1.identifier)
    let resultB = await createSession(args1.userid, args1.identifier)
    let resultC = await createSession(args2.userid, args2.identifier)
    expect(resultA.error).toBeUndefined()
    expect(resultA.sessionid).toMatch(patterns.sessionid)
    expect(resultB.error).toBeUndefined()
    expect(resultB.sessionid).toMatch(patterns.sessionid)
    expect(resultC.error).toBeUndefined()
    expect(resultC.sessionid).toMatch(patterns.sessionid)
    expect(resultA.sessionid).not.toBe(resultB.sessionid)
    expect(resultA.sessionid).not.toBe(resultC.sessionid)
    expect(resultB.sessionid).not.toBe(resultC.sessionid)
  })
})



      
