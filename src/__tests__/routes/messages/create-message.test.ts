process.env.PG_SCHEMA = "createMessageEndpointTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"
import { getErrorMessage } from "../../../lib/error-messages"
import env from "../../../lib/env"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

const testServer = supertest(httpServer)

let sessions = {
  "active": "",
  "inactive": "",
  "unknown": examples.sessionid[0],
}

describe("testing endpoints...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("POST /messages. Preparing database...", async () => {
    let users = [{
      login: examples.login.correct[2],
      password: examples.password.correct[2],
      name: examples.name.correct[2],
    }, {
      login: examples.login.correct[3],
      password: examples.password.correct[3],
      name: examples.name.correct[3],
    }]
    jest.replaceProperty(env.users, "defaultState", "active")
    let result = await testServer.post("/api/v1/profiles").send(users[0])
    expect(result.statusCode).toBe(201)
    expect(result.body).toBeDefined()
    expect(result.body.error).toBeUndefined()
    expect(result.body.profile).toBeDefined()
    expect(result.body.profile.state).toBe("active")
    expect(result.body.session).toMatch(patterns.sessionid)
    sessions.active = result.body.session
    jest.replaceProperty(env.users, "defaultState", "inactive")
    result = await testServer.post("/api/v1/profiles").send(users[1])
    expect(result.statusCode).toBe(201)
    expect(result.body).toBeDefined()
    expect(result.body.error).toBeUndefined()
    expect(result.body.profile).toBeDefined()
    expect(result.body.profile.state).toBe("inactive")
    expect(result.body.session).toMatch(patterns.sessionid)
    sessions.inactive = result.body.session
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    actions: [{
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 1,
  }, {
    tag: 2,
    actions: [{
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: "abcd",
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.region",
        status: 400,
      },
    }],
    exprows: 0,
  }, {
    tag: 3,
    actions: [{
      auth: () => "Bearer " + sessions.inactive,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "appErrors.actionNotAllowed",
        status: 403,
      },
    }],
    exprows: 0,
  }, {
    tag: 4,
    actions: [{
      auth: () => "Bearer " + sessions.unknown,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 401,
      },
    }],
    exprows: 0,
  }, {
    tag: 5,
    actions: [{
      auth: () => "abcd",
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.auth.header",
        status: 401,
      },
    }],
    exprows: 0,
  }, {
    tag: 6,
    actions: [{
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 2,
  }, {
    tag: 7,
    actions: [{
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.messageAlreadyExists",
        status: 409,
      },
    }],
    exprows: 1,
  }, {
    tag: 8,
    actions: [{
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.messageAlreadyExists",
        status: 409,
      },
    }, {
      auth: () => "Bearer " + sessions.active,
      args: [{
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 2,
  }]
  for ( let testcase of testcases ) {
    let { actions, exprows, tag } = testcase
    test(`POST /messages. Test #${tag}`, async () => {
      for ( let action of actions ) {
        let { auth, args, expres } = action
        let [ msgid, content ] = args
        let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
        let result = await testServer.post(url)
          .set("Authorization", auth()).send(content)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toBeDefined()
          expect(result.body.message.region).toBe(msgid.region)
          expect(`${result.body.message.district}`).toBe(msgid.district)
          expect(`${result.body.message.room}`).toBe(msgid.room)
          expect(`${result.body.message.index}`).toBe(msgid.index)
          expect(result.body.message.text).toBe(content.text)
          expect(result.body.message.color).toBe(content.color)
          expect(result.body.message.timestamp).toMatch(patterns.timestamp)
        } else {
          let errorMessage = getErrorMessage(expres.error)
          expect(result.body.error).toStrictEqual(errorMessage)
          expect(result.body.message).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(exprows)
    })
  }
})
        
