import { pool, schema } from "../../../lib/database/conn"
import { getMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages } 
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
  district: message.district,
  room: message.room,
  index: message.index,
  text: message.text,
  color: message.color,
  puid: message.puid,
  username: message.username,
  timestamp: message.timestamp,
})

describe("testing database queries...", () => {
  let userids = []
  let testcases = [{
    tag: 1,
    args: {
      region: databaseMessages[0].region,
      district: databaseMessages[0].district,
      room: databaseMessages[0].room,
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
      district: databaseMessages[10].district,
      room: databaseMessages[10].room,
      index: databaseMessages[10].index,
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[10]),
    },
  }, {
    tag: 3,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
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
        
    
    
