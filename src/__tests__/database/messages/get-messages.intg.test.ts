import { pool, schema } from "../../../lib/database/conn"
import { getMessages } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { databaseMessages, databaseLocations, databaseEmptyLocations,
  messagesByLocation, populateDatabase, 
  examples} from "../../../lib/test-data"

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

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let toMessages = (messageIndices: number[]) => {
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

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: databaseLocations[0].region,
      tag: databaseLocations[0].tag,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByLocation[0]),
    },
  }, {
    tag: 2,
    args: {
      region: databaseLocations[2].region,
      tag: databaseLocations[2].tag,
    },
    expres: {
      error: undefined,
      data: toMessages(messagesByLocation[2]),
    },
  }, {
    tag: 3,
    args: {
      region: databaseEmptyLocations[0].region,
      tag: databaseEmptyLocations[0].tag,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.tooLong,
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



