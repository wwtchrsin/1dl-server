process.env.PG_SCHEMA = "getMessagesTest"

import { pool } from "../../../lib/database/conn"
import { getMessages } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, databaseMessages, databaseRooms, databaseEmptyRooms,
  messagesByRoom, populateDatabase } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let toMessages = (messageIndices: number[]) => {
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

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: databaseRooms[0].region,
      district: databaseRooms[0].district,
      room: databaseRooms[0].room,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByRoom[0]),
    },
  }, {
    tag: 2,
    args: {
      region: databaseRooms[2].region,
      district: databaseRooms[2].district,
      room: databaseRooms[2].room,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByRoom[2]),
    },
  }, {
    tag: 3,
    args: {
      region: databaseEmptyRooms[0].region,
      district: databaseEmptyRooms[0].district,
      room: databaseEmptyRooms[0].room,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMax + 1,
      room: limits.messages.roomMin,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getMessages. Intg Test #${tag}`, async () => {
      let result = await getMessages(args)
      if ( result.data !== undefined ) {
        result.data = sortMessages(result.data)
      }
      expect(result).toStrictEqual(expres)
    })
  }
})



