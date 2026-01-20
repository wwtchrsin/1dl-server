import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, databaseMessages, databaseEmptyRooms } 
  from "../../../lib/test-data"

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
    district: message.district,
    room: message.room,
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
    args: {
      region: databaseMessages[0].region,
      district: databaseMessages[0].district,
      room: databaseMessages[0].room,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 200,
      error: undefined,
      message: message(0),
    },
  }, {
    tag: 2,
    args: {
      region: databaseMessages[8].region,
      district: databaseMessages[8].district,
      room: databaseMessages[8].room,
      index: databaseMessages[8].index,
    },
    expres: {
      status: 200,
      error: undefined,
      message: message(8),
    },
  }, {
    tag: 3,
    args: {
      region: databaseEmptyRooms[2].region,
      district: databaseEmptyRooms[2].district,
      room: databaseEmptyRooms[2].room,
      index: limits.messages.indexMin,
    },
    expres: {
      status: 404,
      error: "databaseConflicts.messageNotFound",
      message: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: databaseMessages[0].district,
      room: databaseMessages[0].room,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      message: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: databaseMessages[0].region,
      district: limits.messages.districtMax + 1,
      room: databaseMessages[0].room,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.district",
      message: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: databaseMessages[0].region,
      district: databaseMessages[0].district,
      room: limits.messages.roomMax + 1,
      index: databaseMessages[0].index,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.room",
      message: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: databaseMessages[0].region,
      district: databaseMessages[0].district,
      room: databaseMessages[0].district,
      index: limits.messages.indexMax + 1,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.index",
      message: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/r/d/room/index. Test #${tag}`, async () => {
      let { region, district, room, index } = args
      let url = `/api/v1/messages/${region}/${district}/${room}/${index}`
      let result = await testServer.get(url)
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

      
    
    
    
