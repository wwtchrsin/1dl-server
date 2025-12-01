process.env.PG_SCHEMA = "getProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getProfile, createProfile, createSession } from "../../../lib/database/users"
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

let wrongSessionId = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85" +
  "f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"

let sessionids = []
let users = new Map()

describe("testing database queries...", () => {
  test("Function getProfile. Preparing database...", async () => {
    let userdata = [{
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    }, {
      login: "2".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "2".repeat(limits.users.nameLenMin),
    }]
    for ( let user of userdata ) {
      let result = await createProfile(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(limits.patterns.uuid)
      expect(result.data.login).toBe(user.login)
      expect(result.data.password).toBeUndefined() 
      expect(result.data.name).toBe(user.name)
      expect(result.data.state).toBeDefined()
      expect(result.data.puid).toMatch(limits.patterns.uuid)
      expect(result.data.timestamp).toMatch(limits.patterns.timestamp)
      let session = await createSession({ login: user.login, password: user.password })
      expect(session.error).toBeUndefined()
      expect(session.data).toBeDefined()
      expect(session.data).toMatch(limits.patterns.sessionid)
      sessionids.push(session.data)
      users.set(session.data, result.data)  
    }
  })
  let testcases = [{
    tag: 1,
    args: () => sessionids[0],
    expres: "success",
  }, {
    tag: 2,
    args: () => sessionids[1],
    expres: "success",
  }, {
    tag: 3,
    args: () => wrongSessionId,
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: () => "abcd",
    expres: "wrongValues.users.sessionid",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getProfile. Intg Test #${tag}`, async () => {
      let sessionid = args()
      let result = await getProfile(sessionid)
      if ( expres === "success" ) {
        let user = users.get(sessionid)        
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toBe(user.userid)
        expect(result.data.login).toBe(user.login)
        expect(result.data.password).toBeUndefined()
        expect(result.data.name).toBe(user.name)
        expect(result.data.state).toBe(user.state)
        expect(result.data.timestamp).toBe(user.timestamp)
        return
      }
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})




      
