import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, databaseMessages, databaseEmptyLocations, examples } 
  from "../../../lib/test-data"
import env from "../../../lib/env"

beforeAll(async () => {
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

let message = (messageIndex: number) => {
  let message = databaseMessages[messageIndex]
  return {
    region: message.region,
    tag: message.tag,
    index: message.index,
    text: message.text,
    color: message.color,
    puid: message.puid,
    username: message.username,
    timestamp: message.timestamp,
  }
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseMessages[0].region,
      tag: databaseMessages[0].tag,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 200,
      error: undefined,
      message: message(0),
    },
  }, {
    tag: 2,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseMessages[8].region,
      tag: databaseMessages[8].tag,
      index: databaseMessages[8].index,
    },
    expres: {
      status: 200,
      error: undefined,
      message: message(8),
    },
  }, {
    tag: 3,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseEmptyLocations[2].region,
      tag: databaseEmptyLocations[2].tag,
      index: limits.message.index.min,
    },
    expres: {
      status: 404,
      error: "databaseConflict.messageNotFound",
      message: undefined,
    },
  }, {
    tag: 4,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: "abcd",
      tag: databaseMessages[0].tag,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.region",
      message: undefined,
    },
  }, {
    tag: 5,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseMessages[0].region,
      tag: examples.tag.tooLong,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.tag",
      message: undefined,
    },
  }, {
    tag: 6,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseMessages[0].region,
      tag: databaseMessages[0].tag,
      index: limits.message.index.max + 1,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.index",
      message: undefined,
    },
  }, {
    tag: 7,
    auth: `Bearer abcd:`,
    args: {
      region: databaseMessages[0].region,
      tag: databaseMessages[0].tag,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      message: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, auth, tag } = testcase
    test(`GET /messages/region/tag/index. Test #${tag}`, async () => {
      let { region, tag, index } = args
      let url = `/api/v1/messages/${region}/${tag}/${index}`
      let result = await testServer.get(url).set("Authorization", auth)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.message).toStrictEqual(expres.message)
      } else {
        expect(result.body.error).toBe(expres.error)
        expect(result.body.message).toBeUndefined()
      }
    })
  }
})

      
    
    
    
