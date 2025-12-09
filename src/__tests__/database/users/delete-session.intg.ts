process.env.PG_SCHEMA = "deleteSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { deleteSession, createSession, createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let correctData = {
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.name.correct[0],
}

let wrongData = {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
  name: examples.name.correct[1],
  userid: examples.uuid[1],
}

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  test("Function deleteSession. Preparing database...", async () => {
    let result = await createProfile(correctData, "active")
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(result.data.userid).toMatch(patterns.uuid)
    correctData.userid = result.data.userid
  })
  let testcases = [{
    tag: 1,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => correctData.userid,
    expres: undefined,
  }, {
    tag: 2,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => wrongData.userid,
    expres: "databaseConflicts.sessionNotFound",
  }, {
    tag: 3,
    init: {
      login: correctData.login,
      password: correctData.password,
    },
    args: () => "abcd", 
    expres: "wrongValues.users.userid",
  }]
  for ( let testcase of testcases ) {
    let { init, args, expres, tag } = testcase
    test(`Function deleteSession. Intg Test #${tag}`, async () => {
      let initResult = await createSession(init)
      expect(initResult.error).toBeUndefined()
      expect(initResult.data).toMatch(patterns.sessionid)
      let sessionid = initResult.data
      let result = await deleteSession(args())
      expect(result).toBe(expres)
      let rowCount = (expres === undefined) ? 0 : 1
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})

      
    
    
