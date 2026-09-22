import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { deleteMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, databaseEmptyLocations } 
  from "../../../lib/test-data"

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

let toMessage = (message: any) => ({
  region: message.region,
  tag: message.tag,
  index: message.index,
  text: message.text,
  color: message.color,
  timestamp: message.timestamp,
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      userid: databaseMessages[2].userid,
      messageid: {
        region: databaseMessages[2].region,
        tag: databaseMessages[2].tag,
        index: databaseMessages[2].index,
      },
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[2]),
    },
    rowCount: databaseMessages.length - 1,
  }, {
    tag: 2,
    args: {
      userid: databaseMessages[6].userid,
      messageid: {
        region: databaseMessages[6].region,
        tag: databaseMessages[6].tag,
        index: databaseMessages[6].index,
      },
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[6]),
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 3,
    args: {
      userid: databaseMessages[2].userid,
      messageid: {
        region: databaseMessages[2].region,
        tag: databaseMessages[2].tag,
        index: databaseMessages[2].index,
      },
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 4,
    args: {
      userid: examples.uuid[0],
      messageid: {
        region: databaseMessages[0].region,
        tag: databaseMessages[0].tag,
        index: databaseMessages[0].index,
      },
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 5,
    args: {
      userid: databaseMessages[0].userid,
      messageid: {
        region: databaseEmptyLocations[0].region,
        tag: databaseEmptyLocations[0].tag,
        index: limits.message.index.min,
      },
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 6,
    args: {
      userid: databaseMessages[1].userid,
      messageid: {
        region: databaseMessages[1].region,
        tag: examples.tag.tooLong,
        index: databaseMessages[1].index,
      },
    },
    expres: {
      error: "databaseConflict.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 7,
    args: {
      userid: "abcd",
      messageid: {
        region: databaseMessages[1].region,
        tag: databaseMessages[1].tag,
        index: databaseMessages[1].index,
      },
    },
    expres: {
      error: "databaseError.deleteMessage",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 8,
    args: {
      userid: databaseMessages[0].userid,
      messageid: {
        region: databaseMessages[0].region,
        tag: databaseMessages[0].tag,
        index: databaseMessages[0].index,
      },
    },
    expres: {
      error: undefined,
      data: toMessage(databaseMessages[0]),
    },
    rowCount: databaseMessages.length - 3,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, rowCount, tag } = testcase
    test(`Function deleteMessage. Intg Test #${tag}`, async () => {
      let result = await deleteMessage(args.userid, args.messageid)
      expect(result).toStrictEqual(expres)
      let table = await queryDatabase("SELECT * FROM messages")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})

    
      
    



