import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseLocations,
  databaseMessages, messagesByLocation, databaseEmptyLocations } from "../../../lib/test-data"
import env from "../../../lib/env"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let messages = (messageIndices: number[]) => {
  return sortMessages(messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    tag: databaseMessages[messageIndex].tag,
    index: databaseMessages[messageIndex].index,
    text: databaseMessages[messageIndex].text,
    color: databaseMessages[messageIndex].color,
    puid: databaseMessages[messageIndex].puid,
    username: databaseMessages[messageIndex].username,
    timestamp: databaseMessages[messageIndex].timestamp,
  })))
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseLocations[0],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByLocation[0]),
    },
  }, {
    tag: 2,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseLocations[2],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByLocation[2]),
    },
  }, {
    tag: 3,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseEmptyLocations[2],
    expres: {
      status: 200,
      error: undefined,
      messages: [],
    },
  }, {
    tag: 4,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: "abcd",
      tag: databaseLocations[0].tag,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.region",
      messages: undefined,
    },
  }, {
    tag: 5,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseLocations[0].region,
      tag: examples.tag.tooLong,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.tag",
      messages: undefined,
    },
  }, {
    tag: 6,
    auth: `Bearer abcd:`,
    args: databaseLocations[0],
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      messages: undefined,
    },
  }, {
    tag: 7,
    auth: `abcd`,
    args: databaseLocations[0],
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      messages: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, auth, tag } = testcase
    test(`GET /messages/region/tag. Test #${tag}`, async () => {
      let { region, tag } = args
      let url = `/api/v1/messages/${region}/${tag}` 
      let result = await testServer.get(url).set("Authorization", auth)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.messages).toStrictEqual(expres.messages)
      } else {
        expect(result.body.error).toBe(expres.error)
        expect(result.body.messages).toBeUndefined()
      }
    })
  }
})



