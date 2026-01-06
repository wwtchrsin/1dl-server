import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions, databaseMessages,
  messagesByUser, sessionByUser, databaseEmptyRooms, databaseCompleteUsers } 
  from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"
import * as redisConn from "../../../lib/redis/conn"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addSessions)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let sessionid = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  return databaseSessions[sessionByUser[userIndex]].sessionid
}

let messageid = (uIndex: number, messageIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  let message = databaseMessages[messagesByUser[userIndex][messageIndex]]
  return {
    region: message.region,
    district: message.district,
    room: message.room,
    index: message.index,
  }
}

let message = (uIndex: number, messageIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  let message = databaseMessages[messagesByUser[userIndex][messageIndex]]
  return {
    region: message.region,
    district: message.district,
    room: message.room,
    index: message.index,
    text: message.text,
    color: message.color,
    timestamp: message.timestamp,
  }
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(0), 
        messageid: messageid(0, 0),
      },
      expres: {
        error: undefined,
        message: message(0, 0),
        status: 200,
      },
    }],
    rowCount: databaseMessages.length - 1,
  }, {
    tag: 2,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(1), 
        messageid: messageid(1, 0),
      },
      expres: {
        error: undefined,
        message: message(1, 0),
        status: 200,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 3,
    actions: [{
      args:  {
        auth: "Bearer " + sessionid(0), 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "databaseConflicts.messageNotFound",
        message: undefined,
        status: 404,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 4,
    actions: [{
      args:  {
        auth: "Bearer " + examples.sessionid[1], 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "databaseConflicts.sessionNotFound",
        message: undefined,
        status: 401,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 5,
    actions: [{
      args: {
        auth: "Bearer abcd", 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "wrongValues.auth.sessionid",
        message: undefined,
        status: 401,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 6,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyRooms[0].region,
          district: databaseEmptyRooms[0].district,
          room: databaseEmptyRooms[0].room,
          index: limits.messages.indexMin,
        },
      },
      expres: {
        error: "databaseConflicts.messageNotFound",
        message: undefined,
        status: 404,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 7,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: "abcd",
          district: databaseEmptyRooms[0].district,
          room: databaseEmptyRooms[0].room,
          index: limits.messages.indexMin,
        },
      },
      expres: {
        error: "wrongValues.messages.region",
        message: undefined,
        status: 400,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 8,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyRooms[0].region,
          district: limits.messages.districtMax + 1,
          room: databaseEmptyRooms[0].room,
          index: limits.messages.indexMin,
        },
      },
      expres: {
        error: "wrongValues.messages.district",
        message: undefined,
        status: 400,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 9,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyRooms[0].region,
          district: databaseEmptyRooms[0].district,
          room: limits.messages.roomMin - 1,
          index: limits.messages.indexMin,
        },
      },
      expres: {
        error: "wrongValues.messages.room",
        message: undefined,
        status: 400,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 10,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyRooms[0].region,
          district: databaseEmptyRooms[0].district,
          room: databaseEmptyRooms[0].room,
          index: limits.messages.indexMax + 1,
        },
      },
      expres: {
        error: "wrongValues.messages.index",
        message: undefined,
        status: 400,
      },
    }],
    rowCount: databaseMessages.length - 2,
  }, {
    tag: 11,
    actions: [{
     args: {
        auth: "Bearer " + sessionid(2), 
        messageid: messageid(2, 0),
      },
      expres: {
        error: undefined,
        message: message(2, 0),
        status: 200,
      },
    }, {
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "databaseConflicts.messageNotFound",
        message: undefined,
        status: 404,
      },
    }, {
      args: {
        auth: "Bearer " + sessionid(3), 
        messageid: messageid(3, 0),
      },
      expres: {
        error: undefined,
        message: message(3, 0),
        status: 200,
      },
    }],
    rowCount: databaseMessages.length - 4,
  }]
  for ( let testcase of testcases ) {
    let { actions, rowCount, tag } = testcase
    test(`DELETE /messages/r/d/room/index. Test #${tag}`, async () => {
      for ( let action of actions ) {
        let { args, expres } = action
        let { auth, messageid } = args
        let { region, district, room, index } = messageid
        let url = `/api/v1/messages/${region}/${district}/${room}/${index}`
        let result = await testServer.delete(url).set("Authorization", auth)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toStrictEqual(expres.message)
        } else {
          let errorMessage = getErrorMessage(expres.error)
          expect(result.body.error).toStrictEqual(errorMessage)
          expect(result.body.message).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
    })
  }
})

      
    
