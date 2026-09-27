import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions,
  sessionByUser, databaseCompleteUsers, databaseUsers } 
  from "../../../lib/test-data"
import env from "../../../lib/env"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let sessionid = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  return databaseSessions[sessionByUser[userIndex]].sessionid
}

let profile = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex] 
  let user = databaseUsers[userIndex]
  return {
    region: user.region,
    login: user.login,
    name: user.name,
    color: user.color,
    state: user.state,
    puid: user.puid,
    timestamp: user.timestamp,
  }
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    args: `Bearer ${env.serviceid}:${sessionid(0)}`,
    expres: {
      status: 200,
      error: undefined,
      profile: profile(0),
    },
  }, {
    tag: 2,
    args: `Bearer ${env.serviceid}:${sessionid(2)}`,
    expres: {
      status: 200,
      error: undefined,
      profile: profile(2),
    },
  }, {
    tag: 3,
    args: `Bearer ${env.serviceid}:${examples.sessionid[0]}`,
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      profile: undefined,
    }
  }, {
    tag: 4,
    args: `Bearer ${env.serviceid}:aaabbb`,
    expres: {
      status: 401,
      error: "wrongValue.auth.sessionid",
      profile: undefined,
    },
  }, {
    tag: 5,
    args: `Bearer aaabbb:${sessionid(0)}`,
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      profile: undefined,
    },
  }, {
    tag: 6,
    args: "aaabbb",
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      profile: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /profile. Test #${tag}`, async () => {
      let result = await testServer.get("/api/v1/profiles")
        .set("Authorization", args)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      expect(result.body.error).toBe(expres.error)
      expect(result.body.profile).toStrictEqual(expres.profile)
    })
  }
})