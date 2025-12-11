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

let messages = [[{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
}, {
  text: examples.text.correct[0],
  color: examples.color.first,
}], [{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 1,
}, {
  text: examples.text.correct[1],
  color: examples.color.first,
}], [{
  region: examples.region.last,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
}, {
  text: examples.text.correct[2],
  color: examples.color.last,
}]]

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
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], messages[0][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 2,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[1], messages[2][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 3,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[0], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[1], messages[2][0]],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }],
  }, {
    tag: 4,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + wrongSessionid, messages[2][0]],
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 401,
      },
    }],
  }, {
    tag: 5,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer abcd", messages[2][0]],
      expres: {
        error: "wrongValues.auth.sessionid",
        status: 401,
      },
    }],
  }, {
    tag: 6,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[1], messages[1][0], messages[1][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], messages[2][0]],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }],
  }, {
    tag: 7,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
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
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], messages[0][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], messages[2][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 9,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], messages[0][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[0], messages[0][0]],
      expres: {
        error: "databaseConflicts.messageNotFound",
        status: 404,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], messages[2][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }],
  }, {
    tag: 10,
    init: [
      () => ["Bearer " + correctSessionids[0], messages[0][0], messages[0][1]],
      () => ["Bearer " + correctSessionids[0], messages[1][0], messages[1][1]],
      () => ["Bearer " + correctSessionids[1], messages[2][0], messages[2][1]],
    ],
    actions: [{
      args: () => ["Bearer " + correctSessionids[0], messages[0][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[0], messages[1][0]],
      expres: {
        error: undefined,
        status: 200,
      },
    }, {
      args: () => ["Bearer " + correctSessionids[1], messages[2][0]],
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
        let [ header, msgid, content ] = args()
        let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
        let result = await testServer.post(url)
          .set("Authorization", header).send(content)
        expect(result.statusCode).toBe(201)
        expect(result.body).toBeDefined()
        expect(result.body.error).toBeUndefined()
        expect(result.body.message).toBeDefined()
      }
      let rowCount = init.length
      for ( let action of actions ) {
        let { args, expres } = action
        let [ header, msgid ] = args()
        let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
        let result = await testServer.delete(url).set("Authorization", header)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toBeDefined()
          expect(result.body.message.region).toBe(msgid.region)
          expect(result.body.message.district).toBe(msgid.district)
          expect(result.body.message.room).toBe(msgid.room)
          expect(result.body.message.index).toBe(msgid.index)
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

      
    
