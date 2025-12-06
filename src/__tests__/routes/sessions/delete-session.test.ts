process.env.PG_SCHEMA = "deleteSessionRouteTest"

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

let testServer = supertest(httpServer)

let users = [{
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.password.correct[0],
}, {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
  name: examples.password.correct[1],
}]

let correctSessions = [
  examples.sessionid[0],
  examples.sessionid[1]
]

let wrongSession = examples.sessionid[2]

describe("testing routes...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    init: [users[0]],
    actions: [{
      args: () => "Bearer " + correctSessions[0],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
    exprows: 0,
  }, {
    tag: 2,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer " + correctSessions[0],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
    exprows: 1,
  }, {
    tag: 3,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer " + correctSessions[1],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
    exprows: 1,
  }, {
    tag: 4,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer " + wrongSession,
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 404,
      },
    }],
    exprows: 2,
  }, {
    tag: 5,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer abcd",
      expres: {
        error: "wrongValues.auth.sessionid",
        status: 401,
      },
    }],
    exprows: 2,
  }, {
    tag: 6,
    init: [users[0], users[1]],
    actions: [{
      args: () => "",
      expres: {
        error: "wrongValues.auth.header",
        status: 401,
      },
    }],
    exprows: 2,
  }, {
    tag: 7,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer " + correctSessions[0],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => "Bearer " + correctSessions[1],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
    exprows: 0,
  }, {
    tag: 8,
    init: [users[0], users[1]],
    actions: [{
      args: () => "Bearer " + correctSessions[0],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => "Bearer " + wrongSession,
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 404,
      },
    }, {
      args: () => "Bearer " + correctSessions[1],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
    exprows: 0,
  }]
  for ( let testcase of testcases ) {
    let { init, actions, exprows, tag } = testcase
    test(`DELETE /sessions. Test #${tag}`, async () => {
      for ( let i=0; i < init.length; i++ ) {
        let result = await testServer.post("/api/v1/profiles").send(init[i])
        expect(result.statusCode).toBe(201)
        expect(result.body).toBeDefined()
        expect(result.body.session).toMatch(patterns.sessionid)
        correctSessions[i] = result.body.session
      }
      for ( let action of actions ) {
        let { args, expres } = action
        let errorMessage = getErrorMessage(expres.error)
        let result = await testServer.delete("/api/v1/sessions")
          .set("Authorization", args())
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        expect(result.body.error).toStrictEqual(errorMessage)
      }
      let result = await queryDatabase("SELECT * FROM sessions")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(exprows)
    })
  }
})


