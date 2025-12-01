process.env.PG_SCHEMA = "createSessionTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createUser, createSession } from "../../../lib/database/users"
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

let correctData = [{
  login: "1".repeat(limits.users.loginLenMin),
  password: "Aa!11111",
  name: "1".repeat(limits.users.nameLenMin),
}, {
  login: "2".repeat(limits.users.loginLenMin),
  password: "Bb@22222",
  name: "2".repeat(limits.users.nameLenMin),
}]

let wrongData = {
  login: "3".repeat(limits.users.loginLenMin),
  password: "Cc#33333",
}

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  test("Function createSession. Preparing database...", async () => {
    for ( let user of correctData ) {
      let result = await createUser(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(limits.patterns.uuid)
      expect(result.data.login).toBe(user.login)
      expect(result.data.password).toBeUndefined() 
      expect(result.data.name).toBe(user.name)
      expect(result.data.state).toBeDefined()
      expect(result.data.puid).toMatch(limits.patterns.uuid)
      expect(result.data.timestamp).toMatch(limits.patterns.timestamp) 
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
    expres: "databaseConflicts.userNotFound",
  }, {
    tag: 4,
    args: {
      login: correctData[0].login,
      password: correctData[1].password,
    },
    expres: "databaseConflicts.userNotFound",
  }, {
    tag: 5,
    args: {
      login: undefined,
      password: correctData[0].password,
    },
    expres: "wrongValues.users.credentialsLogin",
  }, {
    tag: 6,
    args: {
      login: correctData[0].login,
      password: undefined,
    },
    expres: "wrongValues.users.credentialsPassword",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Intg Test #${tag}`, async () => {
      let result = await createSession(args)
      if ( expres === "success" ) {     
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
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
    expect(resultA.data).toMatch(limits.patterns.uuid)
    expect(resultB.error).toBeUndefined()
    expect(resultB.data).toMatch(limits.patterns.uuid)
    expect(resultC.error).toBeUndefined()
    expect(resultC.data).toMatch(limits.patterns.uuid)
    expect(resultA.data).toBe(resultB.data)
    expect(resultA.data).not.toBe(resultC.data)
  })
})



      
