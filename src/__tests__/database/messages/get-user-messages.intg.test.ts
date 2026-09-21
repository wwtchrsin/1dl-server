import { pool, schema } from "../../../lib/database/conn"
import { getUserMessages } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseMessages, messagesByUser } 
  from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
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
    timestamp: databaseMessages[messageIndex].timestamp,
  })))
}

let userid = (messageIndices: number[]) => {
  return databaseMessages[messageIndices[0]].userid
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: userid(messagesByUser[0]),
    expres: {
      error: undefined,
      data: toMessages(messagesByUser[0]),
    },
  }, {
    tag: 2,
    args: userid(messagesByUser[1]),
    expres: {
      error: undefined,
      data: toMessages(messagesByUser[1]),
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
      error: "databaseError.getUserMessages",
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

      
