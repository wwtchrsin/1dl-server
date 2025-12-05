process.env.PG_SCHEMA = "getProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getProfile, createProfile, createSession } from "../../../lib/database/users"
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

let wrongSessionId = examples.sessionid[0]

let sessionids = []
let users = new Map()

describe("testing database queries...", () => {
  test("Function getProfile. Preparing database...", async () => {
    let userdata = [{
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    }, {
      login: examples.login.correct[1],
      password: examples.password.correct[1],
      name: examples.name.correct[1],
    }]
    for ( let user of userdata ) {
      let result = await createProfile(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(patterns.uuid)
      expect(result.data.login).toBe(user.login)
      expect(result.data.password).toBeUndefined() 
      expect(result.data.name).toBe(user.name)
      expect(result.data.state).toBeDefined()
      expect(result.data.puid).toMatch(patterns.uuid)
      expect(result.data.timestamp).toMatch(patterns.timestamp)
      let session = await createSession({ login: user.login, password: user.password })
      expect(session.error).toBeUndefined()
      expect(session.data).toBeDefined()
      expect(session.data).toMatch(patterns.sessionid)
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
    expres: "authErrors.sessionid",
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




      
