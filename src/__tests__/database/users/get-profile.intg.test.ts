process.env.PG_SCHEMA = "getProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getProfile, createProfile } from "../../../lib/database/users"
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

let wrongUserid = examples.uuid[0]

let userids = []
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
      userids.push(result.data.userid)
      users.set(result.data.userid, result.data)  
    }
  })
  let testcases = [{
    tag: 1,
    args: () => userids[0],
    expres: "success",
  }, {
    tag: 2,
    args: () => userids[1],
    expres: "success",
  }, {
    tag: 3,
    args: () => wrongUserid,
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: () => "abcd",
    expres: "wrongValues.users.userid",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getProfile. Intg Test #${tag}`, async () => {
      let userid = args()
      let result = await getProfile(userid)
      if ( expres === "success" ) {
        let user = users.get(userid)        
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toBe(userid)
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




      
