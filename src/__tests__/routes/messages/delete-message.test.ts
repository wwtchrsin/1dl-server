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

let testServer = supertest(httpServer)

let correctSessionids = []

let wrongSessionid = examples.sessionid[0]

let messages = [{
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
}, {
  region: examples.region.last,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[2],
  color: examples.color.last,
}]

let getMessageid = (message: any) => ({
  region: message.region,
  district: message.district,
  room: message.room,
  index: message.index,
})

let wrongIndexMessageid = {
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMax + 1,
}

describe("testing endpoints...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("POST /messages. Preparing database...", async () => {
    let users = [{
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    }, {
      login: examples.login.correct[1],
      password: examples.password.correct[1],
      name: examples.name.correct[1],
    }]
    for ( let user of users ) {
      let result = await testServer.post("/api/v1/profiles").send(user)
      expect(result.statusCode).toBe(201)
      expect(result.body).toBeDefined()
      expect(result.body.error).toBeUndefined()
      expect(result.body.profile).toBeDefined()
      expect(result.body.profile.state).toBe("active")
      expect(result.body.session).toMatch(patterns.sessionid)
      correctSessionids.push(result.body.session)
    }
  })
  let testcases = [{
    tag: 1,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[0])],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 2,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[1], getMessageid(messages[2])],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 3,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[0], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[1], getMessageid(messages[2])],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }],
  }, {
    tag: 4,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + wrongSessionid, getMessageid(messages[2])],
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 401,
      },
    }],
  }, {
    tag: 5,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer abcd", getMessageid(messages[2])],
      expres: {
        error: "wrongValues.auth.sessionid",
        status: 401,
      },
    }],
  }, {
    tag: 6,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[1], messages[1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[2])],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }],
  }, {
    tag: 7,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], wrongIndexMessageid],
      expres: {
        error: "wrongValues.messages.index",
        status: 400,
      },
    }],
  }, {
    tag: 8,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[0])],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], getMessageid(messages[2])],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 9,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[0])],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[0])],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], getMessageid(messages[2])],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 10,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0]],
      () => ["Bearer " + correctSessionids[0], messages[1]],
      () => ["Bearer " + correctSessionids[1], messages[2]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[0])],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[0], getMessageid(messages[1])],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], getMessageid(messages[2])],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }]
  for ( let testcase of testcases ) {
    let { init, actions, tag } = testcase
    test(`DELETE /messages. Test #${tag}`, async () => {
      for ( let args of init ) {
        let [ header, messageid ] = args()
        let result = await testServer.post("/api/v1/messages")
          .set("Authorization", header).send(messageid)
        expect(result.statusCode).toBe(201)
        expect(result.body).toBeDefined()
        expect(result.body.error).toBeUndefined()
        expect(result.body.message).toBeDefined()
      }
      let rowCount = init.length
      for ( let action of actions ) {
        let { args, expres } = action
        let [ header, messageid ] = args()
        let result = await testServer.delete("/api/v1/messages")
          .set("Authorization", header).send(messageid)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toBeDefined()
          expect(result.body.message.region).toBe(messageid.region)
          expect(result.body.message.district).toBe(messageid.district)
          expect(result.body.message.room).toBe(messageid.room)
          expect(result.body.message.index).toBe(messageid.index)
          expect(result.body.message.text).toBeDefined()
          expect(result.body.message.color).toBeDefined()
          expect(result.body.message.timestamp).toBeDefined()
          rowCount--
        } else {
          let errorMessage = getErrorMessage(expres.error)
          expect(result.body.error).toStrictEqual(errorMessage)
          expect(result.body.message).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
    })
  }
})

      
    
