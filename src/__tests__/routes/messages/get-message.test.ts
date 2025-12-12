process.env.PG_SCHEMA = "getMessageEndpointTest"

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

let wrongMessageid = {
  region: examples.region.first,
  district: limits.messages.districtMin + 1,
  room: limits.messages.roomMin + 2,
  index: limits.messages.indexMin + 3,
}

describe("testing endpoints...", () => {
  test("GET /messages/r/d/room/index. Preparing database...", async () => {
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
    for ( let i=0; i < messages.length; i++ ) {
      let [ msgid, content ] = messages[i]
      let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
      let result = await testServer.post(url)
        .set("Authorization", "Bearer " + sessionids[i % sessionids.length])
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
  })
  let testcases = [{
    tag: 1,
    args: messages[0][0],
    expres: {
      status: 200,
      error: undefined,
      data: messages[0][1],
    },
  }, {
    tag: 2,
    args: messages[2][0],
    expres: {
      status: 200,
      error: undefined,
      data: messages[2][1],
    },
  }, {
    tag: 3,
    args: wrongMessageid,
    expres: {
      status: 404,
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/r/d/room/index. Test #${tag}`, async () => {
      let url = `/api/v1/messages/${args.region}/${args.district}/${args.room}/${args.index}` 
      let result = await testServer.get(url)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.message).toBeDefined()
        expect(result.body.message.region).toBe(args.region)
        expect(result.body.message.district).toBe(args.district)
        expect(result.body.message.room).toBe(args.room)
        expect(result.body.message.index).toBe(args.index)
        expect(result.body.message.text).toBe(expres.data.text)
        expect(result.body.message.color).toBe(expres.data.color)
        expect(result.body.message.username).toBeDefined()
        expect(result.body.message.puid).toMatch(patterns.uuid)
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.message).toBeUndefined()
      }
    })
  }
})

      
    
    
    
