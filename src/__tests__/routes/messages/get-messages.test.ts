process.env.PG_SCHEMA = "getMessagesEndpointTest"

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

let messages = [{
  room: {
    region: examples.region.first,
    district: limits.messages.districtMin,
    room: limits.messages.roomMin,
  },
  msgs: [[{
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
    color: examples.color.some,
  }]],
}, {
  room: {
    region: examples.region.last,
    district: limits.messages.districtMax,
    room: limits.messages.roomMax,
  },
  msgs: [[{
    region: examples.region.last,
    district: limits.messages.districtMax,
    room: limits.messages.roomMax,
    index: limits.messages.indexMax,
  }, {
    text: examples.text.correct[2],
    color: examples.color.last,
  }]],
}]

let emptyRoom = {
  region: examples.region.first,
  district: limits.messages.districtMin + 1,
  room: limits.messages.roomMin + 2,
}

describe("testing endpoints...", () => {
  test("GET /messages/r/d/room. Preparing database...", async () => {
    let users = [{
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    }, {
      login: examples.login.correct[1],
      password: examples.password.correct[1],
      name: examples.name.correct[1],
    }]
    let sessionids = []
    for ( let user of users ) {
      let result = await testServer.post("/api/v1/profiles").send(user)
      expect(result.statusCode).toBe(201)
      expect(result.body).toBeDefined()
      expect(result.body.error).toBeUndefined()
      expect(result.body.profile).toBeDefined()
      expect(result.body.session).toMatch(patterns.sessionid)
      sessionids.push(result.body.session)
    }
    let msgCount = 0
    for ( let i=0; i < messages.length; i++ ) {
      for ( let j=0; j < messages[i].msgs.length; j++ ) {
        let [ msgid, content ] = messages[i].msgs[j]
        let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
        let result = await testServer.post(url)
          .set("Authorization", "Bearer " + sessionids[msgCount++ % sessionids.length])
          .send(content)
        expect(result.statusCode).toBe(201)
        expect(result.body).toBeDefined()
        expect(result.body.error).toBeUndefined()
        expect(result.body.message).toBeDefined()
        expect(result.body.message.region).toBe(msgid.region)
        expect(result.body.message.district).toBe(msgid.district)
        expect(result.body.message.room).toBe(msgid.room)
        expect(result.body.message.index).toBe(msgid.index)
        expect(result.body.message.text).toBe(content.text)
        expect(result.body.message.color).toBe(content.color)
        expect(result.body.message.userid).toBeUndefined()
        expect(result.body.message.timestamp).toMatch(patterns.timestamp)
      }
    }
  })
  let testcases = [{
    tag: 1,
    args: messages[0].room,
    expres: {
      status: 200,
      error: undefined,
      messages: messages[0].msgs.length,
    },
  }, {
    tag: 2,
    args: messages[1].room,
    expres: {
      status: 200,
      error: undefined,
      messages: messages[1].msgs.length,
    },
  }, {
    tag: 3,
    args: emptyRoom,
    expres: {
      status: 200,
      error: undefined,
      messages: 0,
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      messages: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/r/d/room. Test #${tag}`, async () => {
      let url = `/api/v1/messages/${args.region}/${args.district}/${args.room}` 
      let result = await testServer.get(url)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.messages).toBeDefined()
        expect(result.body.messages).toHaveLength(expres.messages)
        for ( let i=0; i < expres.messages; i++ ) {
          expect(result.body.messages[i].region).toBe(args.region)
          expect(result.body.messages[i].district).toBe(args.district)
          expect(result.body.messages[i].room).toBe(args.room)
          expect(result.body.messages[i].index).toBeDefined()
          expect(result.body.messages[i].text).toBeDefined()
          expect(result.body.messages[i].color).toBeDefined()
          expect(result.body.messages[i].username).toBeDefined()
          expect(result.body.messages[i].puid).toMatch(patterns.uuid)
          expect(result.body.messages[i].timestamp).toMatch(patterns.timestamp)
        }
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.message).toBeUndefined()
      }
    })
  }
})

  

