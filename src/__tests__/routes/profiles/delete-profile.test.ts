process.env.PG_SCHEMA = "deleteProfileRouteTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"
import { getErrorMessage } from "../../../lib/error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

const testServer = supertest(httpServer)

let profiles = [{
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.name.correct[0],
}, {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
  name: examples.name.correct[1],
}]

let knownSessionids = []

let unknownSessionid = examples.sessionid[0]

let messages = [[{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[0],
  color: examples.color.first,
}, {
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 1,
  text: examples.text.correct[1],
  color: examples.color.first,
}], []]

describe("testing routes...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM sessions")
    await pool.query("DELETE FROM messages")
  })
  let testcases = [{
    tag: 1,
    args: () => "Bearer " + knownSessionids[0],
    expres: {
      status: 200,
      error: undefined,
      profile: profiles[0],
      messages: messages[0],
    },
    exprows: {
      users: 1,
      messages: 0,
      sessions: 1,
    },
  }, {
    tag: 2,
    args: () => "Bearer " + knownSessionids[1],
    expres: {
      status: 200,
      error: undefined,
      profile: profiles[1],
      messages: messages[1],
    },
    exprows: {
      users: 1,
      messages: 2,
      sessions: 1,
    },
  }, {
    tag: 3,
    args: () => "Bearer " + unknownSessionid,
    expres: {
      status: 404,
      error: "databaseConflicts.sessionNotFound",
      profile: undefined,
      messages: undefined,
    },
    exprows: {
      users: 2,
      messages: 2,
      sessions: 2,
    },
  }, {
    tag: 4,
    args: () => "Bearer abcd",
    expres: {
      status: 401,
      error: "wrongValues.auth.sessionid",
      profile: undefined,
      messages: undefined,
    },
    exprows: {
      users: 2,
      messages: 2,
      sessions: 2,
    },
  }, {
    tag: 5,
    args: () => "abcd",
    expres: {
      status: 401,
      error: "wrongValues.auth.header",
      profile: undefined,
      messages: undefined,
    },
    exprows: {
      users: 2,
      messages: 2,
      sessions: 2,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, exprows, tag } = testcase
    test(`DELETE /profiles. Test #${tag}`, async () => {
      for ( let i=0; i < profiles.length; i++ ) {
        let result = await testServer.post("/api/v1/profiles").send(profiles[i])
        expect(result.statusCode).toBe(201)
        expect(result.body).toBeDefined()
        expect(result.body.error).toBeUndefined()
        expect(result.body.session).toMatch(patterns.sessionid)
        expect(result.body.profile).toBeDefined()
        expect(result.body.profile.login).toBe(profiles[i].login)
        knownSessionids[i] = result.body.session
      }
      for ( let i=0; i < messages.length; i++ ) {
        for ( let j=0; j < messages[i].length; j++ ) {
          let result = await testServer.post("/api/v1/messages")
            .set("Authorization", "Bearer " + knownSessionids[i])
            .send(messages[i][j])
          expect(result.statusCode).toBe(201)
          expect(result.body).toBeDefined()
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toBeDefined()
        }
      }
      let result = await testServer.delete("/api/v1/profiles")
        .set("Authorization", args())
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.profile).toBeDefined()
        expect(result.body.profile.login).toBe(expres.profile.login)
        expect(result.body.profile.name).toBe(expres.profile.name)
        expect(result.body.messages).toHaveLength(expres.messages.length)
        for ( let i=0; i < expres.messages.length; i++ ) {
          expect(result.body.messages[i].region).toBeDefined()
          expect(result.body.messages[i].district).toBeDefined()
          expect(result.body.messages[i].room).toBeDefined()
          expect(result.body.messages[i].index).toBeDefined()
          expect(result.body.messages[i].text).toBeDefined()
          expect(result.body.messages[i].color).toBeDefined()
          expect(result.body.messages[i].timestamp).toBeDefined()
        }
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.profile).toBeUndefined()
        expect(result.body.messages).toBeUndefined()
      }
      let userTable = await queryDatabase("SELECT * FROM users")
      let sessionTable = await queryDatabase("SELECT * FROM sessions")
      let messageTable = await queryDatabase("SELECT * FROM messages")
      expect(userTable).toBeDefined()
      expect(userTable.rows).toHaveLength(exprows.users)
      expect(sessionTable).toBeDefined()
      expect(sessionTable.rows).toHaveLength(exprows.sessions)
      expect(messageTable).toBeDefined()
      expect(messageTable.rows).toHaveLength(exprows.messages)
    })
  }
})

