import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, completeUsersByRegion,
  inactiveUsersByRegion, sessionByUser, databaseSessions } 
  from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"
import * as redisConn from "../../../lib/redis/conn"
import { getReports } from "../../../lib/redis/tests"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addSessions)
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

let sessionid = (userIndex: number) => {
  return databaseSessions[sessionByUser[userIndex]].sessionid
}

describe("testing endpoints...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  afterEach(async () => {
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
  })
  let testcases = [{
    tag: 1,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 1,
  }, {
    tag: 2,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[1][0]),
      args: [{
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      }, {
        text: examples.text.maxLen,
        color: examples.color.last,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 1,
  }, {
    tag: 3,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: "abcd",
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.region",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 4,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.district",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 5,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMax + 1}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.room",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 6,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax + 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.index",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 7,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.tooShort,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.messages.text",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 8,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: "abcd",
      }],
      expres: {
        error: "wrongValues.messages.color",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 9,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[1][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "appErrors.actionNotAllowed",
        status: 403,
      },
    }],
    rowCount: 0,
  }, {
    tag: 10,
    actions: [{
      auth: () => "Bearer " + sessionid(inactiveUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "appErrors.actionNotAllowed",
        status: 403,
      },
    }],
    rowCount: 0,
  }, {
    tag: 11,
    actions: [{
      auth: () => "Bearer " + examples.sessionid[0],
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.sessionNotFound",
        status: 401,
      },
    }],
    rowCount: 0,
  }, {
    tag: 12,
    actions: [{
      auth: () => "abcd",
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "wrongValues.auth.header",
        status: 401,
      },
    }],
    rowCount: 0,
  }, {
    tag: 13,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 2,
  }, {
    tag: 14,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.messageAlreadyExists",
        status: 409,
      },
    }],
    rowCount: 1,
  }, {
    tag: 15,
    actions: [{
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: "databaseConflicts.messageAlreadyExists",
        status: 409,
      },
    }, {
      auth: () => "Bearer " + sessionid(completeUsersByRegion[0][0]),
      args: [{
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      }],
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 2,
  }]
  for ( let testcase of testcases ) {
    let { actions, rowCount, tag } = testcase
    test(`POST /messages/r/d/room/index. Test #${tag}`, async () => {
      let reportsPromise = getReports(`messages:created`, rowCount)
      for ( let action of actions ) {
        let { auth, args, expres } = action
        let [ msgid, content ] = args
        let url = `/api/v1/messages/${msgid.region}/${msgid.district}/${msgid.room}/${msgid.index}`
        let result = await testServer.post(url)
          .set("Authorization", auth()).send(content)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.message).toBeDefined()
          expect(result.body.message.region).toBe(msgid.region)
          expect(`${result.body.message.district}`).toBe(msgid.district)
          expect(`${result.body.message.room}`).toBe(msgid.room)
          expect(`${result.body.message.index}`).toBe(msgid.index)
          expect(result.body.message.text).toBe(content.text)
          expect(result.body.message.color).toBe(content.color)
          expect(result.body.message.timestamp).toMatch(patterns.timestamp)
        } else {
          let errorMessage = getErrorMessage(expres.error)
          expect(result.body.error).toStrictEqual(errorMessage)
          expect(result.body.message).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
      let reports = await reportsPromise
      expect(reports).toHaveLength(rowCount)
      for ( let i=0; i < reports.length; i++ ) {
        expect(reports[i].messages).toBeDefined()
        expect(reports[i].messages).toHaveLength(1)
        expect(reports[i].messages[0].region).toBeDefined()
        expect(reports[i].messages[0].district).toBeDefined()
        expect(reports[i].messages[0].room).toBeDefined()
        expect(reports[i].messages[0].index).toBeDefined()
        expect(reports[i].messages[0].text).toBeDefined()
        expect(reports[i].messages[0].color).toBeDefined()
        expect(reports[i].messages[0].puid).toBeDefined()
        expect(reports[i].messages[0].username).toBeDefined()
        expect(reports[i].messages[0].timestamp).toBeDefined()
      }
    })
  }
})
        
