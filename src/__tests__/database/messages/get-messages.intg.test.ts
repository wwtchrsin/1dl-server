import { pool, schema } from "../../../lib/database/conn"
import { getMessages } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { databaseMessages, databaseZones, databaseEmptyZones,
  messagesByZone, populateDatabase } from "../../../lib/test-data"

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

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let toMessages = (messageIndices: number[]) => {
  return sortMessages(messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    district: databaseMessages[messageIndex].district,
    zone: databaseMessages[messageIndex].zone,
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
      region: databaseZones[0].region,
      district: databaseZones[0].district,
      zone: databaseZones[0].zone,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByZone[0]),
    },
  }, {
    tag: 2,
    args: {
      region: databaseZones[2].region,
      district: databaseZones[2].district,
      zone: databaseZones[2].zone,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByZone[2]),
    },
  }, {
    tag: 3,
    args: {
      region: databaseEmptyZones[0].region,
      district: databaseEmptyZones[0].district,
      zone: databaseEmptyZones[0].zone,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: {
      region: limits.message.region.values[0],
      district: limits.message.district.max + 1,
      zone: limits.message.zone.min,
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



