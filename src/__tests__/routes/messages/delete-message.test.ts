import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions, databaseMessages,
  messagesByUser, sessionByUser, databaseEmptyZones, databaseCompleteUsers } 
  from "../../../lib/test-data"
import * as redisConn from "../../../lib/redis/conn"
import { getReports } from "../../../lib/redis/tests"

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
    zone: message.zone,
    index: message.index,
  }
}

let message = (uIndex: number, messageIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  let message = databaseMessages[messagesByUser[userIndex][messageIndex]]
  return {
    region: message.region,
    district: message.district,
    zone: message.zone,
    index: message.index,
    text: message.text,
    color: message.color,
    timestamp: message.timestamp,
  }
}

let rowCount = databaseMessages.length

describe("testing endpoints...", () => {
  afterEach(async () => {
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
  })
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
    deletedRows: 1,
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
    deletedRows: 1,
  }, {
    tag: 3,
    actions: [{
      args:  {
        auth: "Bearer " + sessionid(0), 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "databaseConflict.messageNotFound",
        message: undefined,
        status: 404,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 4,
    actions: [{
      args:  {
        auth: "Bearer " + examples.sessionid[1], 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "databaseConflict.sessionNotFound",
        message: undefined,
        status: 401,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 5,
    actions: [{
      args: {
        auth: "Bearer abcd", 
        messageid: messageid(2, 0),
      },
      expres: {
        error: "wrongValue.auth.sessionid",
        message: undefined,
        status: 401,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 6,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
      },
      expres: {
        error: "databaseConflict.messageNotFound",
        message: undefined,
        status: 404,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 7,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: "abcd",
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
      },
      expres: {
        error: "wrongValue.message.region",
        message: undefined,
        status: 400,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 8,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyZones[0].region,
          district: limits.message.district.max + 1,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
      },
      expres: {
        error: "wrongValue.message.district",
        message: undefined,
        status: 400,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 9,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: limits.message.zone.min - 1,
          index: limits.message.index.min,
        },
      },
      expres: {
        error: "wrongValue.message.zone",
        message: undefined,
        status: 400,
      },
    }],
    deletedRows: 0,
  }, {
    tag: 10,
    actions: [{
      args: {
        auth: "Bearer " + sessionid(2), 
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.max + 1,
        },
      },
      expres: {
        error: "wrongValue.message.index",
        message: undefined,
        status: 400,
      },
    }],
    deletedRows: 0,
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
        error: "databaseConflict.messageNotFound",
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
    deletedRows: 2,
  }]
  for ( let testcase of testcases ) {
    let { actions, deletedRows, tag } = testcase
    test(`DELETE /messages/r/d/zone/index. Test #${tag}`, async () => {
      let reportsPromise = getReports("messages:deleted", deletedRows)
      for ( let action of actions ) {
        let { args, expres } = action
        let { auth, messageid } = args
        let { region, district, zone, index } = messageid
        let url = `/api/v1/messages/${region}/${district}/${zone}/${index}`
        let result = await testServer.delete(url).set("Authorization", auth)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toStrictEqual(expres.message)
        } else {
          expect(result.body.error).toBe(expres.error)
          expect(result.body.message).toBeUndefined()
        }
      }
      rowCount -= deletedRows
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
      let reports = await reportsPromise
      expect(reports).toHaveLength(deletedRows)
      for ( let i=0; i < reports.length; i++ ) {
        expect(reports[i].messageids).toBeDefined()
        expect(reports[i].messageids).toHaveLength(1)
        expect(reports[i].messageids[0].region).toBeDefined()
        expect(reports[i].messageids[0].district).toBeDefined()
        expect(reports[i].messageids[0].zone).toBeDefined()
        expect(reports[i].messageids[0].index).toBeDefined()
        expect(reports[i].messageids[0].text).toBeUndefined()
        expect(reports[i].messageids[0].color).toBeUndefined()
        expect(reports[i].messageids[0].puid).toBeUndefined()
        expect(reports[i].messageids[0].username).toBeUndefined()
        expect(reports[i].messageids[0].timestamp).toBeUndefined()
      }
    })
  }
})

      
    
