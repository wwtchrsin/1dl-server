process.env.PG_SCHEMA = "createSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createProfile, createSession } from "../../../lib/database/users"
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

let correctData = [{
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.name.correct[0],
}, {
  login: examples.login.correct[2],
  password: examples.password.correct[2],
  name: examples.name.correct[2],
}]

let wrongData = {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
}

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  test("Function createSession. Preparing database...", async () => {
    for ( let user of correctData ) {
      let result = await createProfile(user, "active")
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(patterns.uuid)
      expect(result.data.login).toBe(user.login)
      expect(result.data.password).toBeUndefined() 
      expect(result.data.name).toBe(user.name)
      expect(result.data.state).toBeDefined()
      expect(result.data.puid).toMatch(patterns.uuid)
      expect(result.data.timestamp).toMatch(patterns.timestamp) 
    }
  })
  let testcases = [{
    tag: 1,
    args: {
      login: correctData[0].login,
      password: correctData[0].password,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      login: correctData[1].login,
      password: correctData[1].password,
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      login: wrongData.login,
      password: wrongData.password,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: {
      login: correctData[0].login,
      password: correctData[1].password,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: {
      login: undefined,
      password: correctData[0].password,
    },
    expres: "wrongValues.auth.login",
  }, {
    tag: 6,
    args: {
      login: correctData[0].login,
      password: undefined,
    },
    expres: "wrongValues.auth.password",
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
      login: correctData[0].login,
      password: correctData[0].password,
    }
    let args2 = {
      login: correctData[1].login,
      password: correctData[1].password,
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



      
