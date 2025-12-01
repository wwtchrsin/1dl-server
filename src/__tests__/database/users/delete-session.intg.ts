process.env.PG_SCHEMA = "deleteSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { deleteSession, createSession, createUser } from "../../../lib/database/users"
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

let correctData = {
  login: "1".repeat(limits.users.loginLenMin),
  password: "Aa!11111",
  name: "1".repeat(limits.users.nameLenMin),
}

let wrongData = {
  login: "2".repeat(limits.users.loginLenMin),
  password: "Bb@22222",
  name: "2".repeat(limits.users.nameLenMin),
  sessionid: "53e291f8-522b-43b8-a5f5-84795b887a81",
}

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  test("Function deleteSession. Preparing database...", async () => {
    let result = await createUser(correctData)
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(result.data.userid).toMatch(limits.patterns.uuid)
    correctData.userid = result.data.userid
  })
  let testcases = [{
    tag: 1,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => correctData.sessionid,
    expres: "success",
  }, {
    tag: 2,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => wrongData.sessionid,
    expres: "databaseConflicts.sessionNotFound",
  }, {
    tag: 3,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => "abcd", 
    expres: "wrongValues.users.sessionid",
  }]
  for ( let testcase of testcases ) {
    let { init, args, expres, tag } = testcase
    test(`Function deleteSession. Intg Test #${tag}`, async () => {
      let sessionids = new Map<string, string>() 
      let initResult = await createSession(init)
      expect(initResult.error).toBeUndefined()
      expect(initResult.data).toMatch(limits.patterns.uuid)
      correctData.sessionid = initResult.data
      let result = await deleteSession(args())
      let rowCount = 1
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
        expect(result.data).toBe(correctData.userid)
        rowCount--
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})

      
    
    
