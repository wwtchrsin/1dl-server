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
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      login: databaseUsers[2].login,
      password: databaseUsers[2].password,
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      login: databaseUsers[0].login,
      password: databaseUsers[1].password,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: {
      login: examples.login.minLen,
      password: examples.password.minLen,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: {
      login: undefined,
      password: databaseUsers[0].password,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 6,
    args: {
      login: databaseUsers[0].login,
      password: undefined,
    },
    expres: "databaseConflicts.profileNotFound",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Intg Test #${tag}`, async () => {
      let result = await createSession(args)
      let rowCount = 0      
      if ( expres === "success" ) {     
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(patterns.sessionid)
        rowCount++
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
  test("Function createSession. Intg Test #7", async () => {
    let args1 = {
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
    }
    let args2 = {
      login: databaseUsers[1].login,
      password: databaseUsers[1].password,
    }
    let resultA = await createSession(args1)
    let resultB = await createSession(args1)
    let resultC = await createSession(args2)
    expect(resultA.error).toBeUndefined()
    expect(resultA.data).toMatch(patterns.sessionid)
    expect(resultB.error).toBeUndefined()
    expect(resultB.data).toMatch(patterns.sessionid)
    expect(resultC.error).toBeUndefined()
    expect(resultC.data).toMatch(patterns.sessionid)
    expect(resultA.data).not.toBe(resultB.data)
    expect(resultA.data).not.toBe(resultC.data)
  })
})



      
