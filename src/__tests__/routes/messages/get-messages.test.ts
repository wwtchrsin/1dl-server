import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, databaseRooms,
  databaseMessages, messagesByRoom, databaseEmptyRooms } from "../../../lib/test-data"

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

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let messages = (messageIndices: number[]) => {
  return sortMessages(messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    district: databaseMessages[messageIndex].district,
    room: databaseMessages[messageIndex].room,
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
    args: databaseRooms[0],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByRoom[0]),
    },
  }, {
    tag: 2,
    args: databaseRooms[4],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByRoom[4]),
    },
  }, {
    tag: 3,
    args: databaseEmptyRooms[2],
    expres: {
      status: 200,
      error: undefined,
      messages: [],
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: databaseRooms[0].district,
      room: databaseRooms[0].room,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      messages: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: databaseRooms[0].region,
      district: limits.message.district.max + 1,
      room: databaseRooms[0].room,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.district",
      messages: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: databaseRooms[0].region,
      district: limits.message.district.max,
      room: "abcd",
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.room",
      messages: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/r/d/room. Test #${tag}`, async () => {
      let { region, district, room } = args
      let url = `/api/v1/messages/${region}/${district}/${room}` 
      let result = await testServer.get(url)
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



