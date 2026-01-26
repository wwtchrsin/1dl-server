import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { deleteMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, databaseEmptyRooms } 
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
  timestamp: message.timestamp,
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      userid: databaseMessages[2].userid,
      messageid: {
        region: databaseMessages[2].region,
        district: databaseMessages[2].district,
        room: databaseMessages[2].room,
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
        district: databaseMessages[6].district,
        room: databaseMessages[6].room,
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
        district: databaseMessages[2].district,
        room: databaseMessages[2].room,
        index: databaseMessages[2].index,
      },
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 4,
    args: {
      userid: examples.uuid[0],
      messageid: {
        region: databaseMessages[0].region,
        district: databaseMessages[0].district,
        room: databaseMessages[0].room,
        index: databaseMessages[0].index,
      },
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 5,
    args: {
      userid: databaseMessages[0].userid,
      messageid: {
        region: databaseEmptyRooms[0].region,
        district: databaseEmptyRooms[0].district,
        room: databaseEmptyRooms[0].room,
        index: limits.message.index.min,
      },
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 6,
    args: {
      userid: databaseMessages[1].userid,
      messageid: {
        region: databaseMessages[1].region,
        district: databaseMessages[1].district,
        room: limits.message.room.max + 1,
        index: databaseMessages[1].index,
      },
    },
    expres: {
      error: "databaseConflicts.messageNotFound",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 7,
    args: {
      userid: "abcd",
      messageid: {
        region: databaseMessages[1].region,
        district: databaseMessages[1].district,
        room: limits.message.room.max + 1,
        index: databaseMessages[1].index,
      },
    },
    expres: {
      error: "databaseErrors.deleteMessage",
      data: undefined,
    },
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 8,
    args: {
      userid: databaseMessages[0].userid,
      messageid: {
        region: databaseMessages[0].region,
        district: databaseMessages[0].district,
        room: databaseMessages[0].room,
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

    
      
    



