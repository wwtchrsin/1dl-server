import { pool, schema } from "../../../lib/database/conn"
import { getMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, databaseEmptyLocations } 
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

let toMessage = (message: any) => ({
  region: message.region,
  tag: message.tag,
  index: message.index,
  text: message.text,
  color: message.color,
  puid: message.puid,
  username: message.username,
  timestamp: message.timestamp,
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: databaseMessages[0].region,
      tag: databaseMessages[0].tag,
      index: databaseMessages[0].index,
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[0]),
    },
  }, {
    tag: 2,
    args: {
      region: databaseMessages[10].region,
      tag: databaseMessages[10].tag,
      index: databaseMessages[10].index,
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[10]),
    },
  }, {
    tag: 3,
    args: {
      region: databaseEmptyLocations[0].region,
      tag: databaseEmptyLocations[0].tag,
      index: limits.message.index.min,
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      tag: examples.tag.minLen,
      index: limits.message.index.min,
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getMessage. Intg Test #${tag}`, async () => {
      let result = await getMessage(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
        
    
    
