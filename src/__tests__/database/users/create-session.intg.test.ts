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
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: undefined,
      userid: databaseUsers[0].userid,
    },
  }, {
    tag: 2,
    args: {
      region: databaseUsers[2].region,
      login: databaseUsers[2].login,
      password: databaseUsers[2].password,
      identifier: examples.sessionid[2],
    },
    expres: {
      error: undefined,
      userid: databaseUsers[2].userid,
    },
  }, {
    tag: 3,
    args: {
      region: "a",
      login: databaseUsers[2].login,
      password: databaseUsers[2].password,
      identifier: examples.sessionid[2],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[1].password,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      login: examples.login.minLen,
      password: examples.password.minLen,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: undefined,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: databaseUsers[0].region,
      login: undefined,
      password: databaseUsers[0].password,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 8,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: undefined,
      identifier: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 9,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
      identifier: undefined,
    },
    expres: {
      error: "databaseError.createSession",
      userid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Intg Test #${tag}`, async () => {
      let result = await createSession(args)
      let rowCount = 0      
      if ( expres.error === undefined ) {     
        expect(result.error).toBeUndefined()
        expect(result.sessionid).toMatch(patterns.sessionid)
        expect(result.userid).toBe(expres.userid)
        rowCount++
      } else {
        expect(result.error).toBe(expres.error)
        expect(result.sessionid).toBeUndefined()
        expect(result.userid).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
  test("Function createSession. Intg Test #8", async () => {
    let args1 = {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
      identifier: examples.sessionid[0],
    }
    let args2 = {
      region: databaseUsers[1].region,
      login: databaseUsers[1].login,
      password: databaseUsers[1].password,
      identifier: examples.sessionid[1],
    }
    let resultA = await createSession(args1)
    let resultB = await createSession(args1)
    let resultC = await createSession(args2)
    expect(resultA.error).toBeUndefined()
    expect(resultA.sessionid).toMatch(patterns.sessionid)
    expect(resultA.userid).toBe(databaseUsers[0].userid)
    expect(resultB.error).toBeUndefined()
    expect(resultB.sessionid).toMatch(patterns.sessionid)
    expect(resultB.userid).toBe(databaseUsers[0].userid)
    expect(resultC.error).toBeUndefined()
    expect(resultC.sessionid).toMatch(patterns.sessionid)
    expect(resultC.userid).toBe(databaseUsers[1].userid)
    expect(resultA.sessionid).not.toBe(resultB.sessionid)
    expect(resultA.sessionid).not.toBe(resultC.sessionid)
    expect(resultB.sessionid).not.toBe(resultC.sessionid)
  })
})



      
