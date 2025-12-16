process.env.PG_SCHEMA = "getUserMessagesTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getUserMessages } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, messagesByUser } 
  from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let toFunctionOutput = (messageIndices: number[]) => {
  return messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    district: databaseMessages[messageIndex].district,
    room: databaseMessages[messageIndex].room,
    index: databaseMessages[messageIndex].index,
    text: databaseMessages[messageIndex].text,
    color: databaseMessages[messageIndex].color,
    timestamp: databaseMessages[messageIndex].timestamp,
  }))
}

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: databaseMessages[messagesByUser[0][0]].userid,
    expres: {
      error: undefined,
      data: sortMessages(toFunctionOutput(messagesByUser[0])),
    },
  }, {
    tag: 2,
    args: databaseMessages[messagesByUser[1][0]].userid,
    expres: {
      error: undefined,
      data: sortMessages(toFunctionOutput(messagesByUser[1])),
    },
  }, {
    tag: 3,
    args: examples.uuid[0],
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "wrongValues.users.userid",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getUserMessages. Intg Test ${tag}`, async () => {
      let result = await getUserMessages(args)
      if ( expres.data !== undefined ) {
        expres.data = sortMessages(expres.data)
      }
      expect(result).toStrictEqual(expres)
    })
  }
})

      
