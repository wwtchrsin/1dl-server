import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions,
  sessionByUser, databaseCompleteUsers, databaseUsers,
  databaseMessages, messagesByUser } from "../../../lib/test-data"
import * as redisConn from "../../../lib/redis/conn"
import { getReports } from "../../../lib/redis/tests"
import env from "../../../lib/env"

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

let profile = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex] 
  let user = databaseUsers[userIndex]
  return {
    region: user.region,
    login: user.login,
    name: user.name,
    state: user.state,
    puid: user.puid,
    timestamp: user.timestamp,
  }
}

let userid = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  return databaseUsers[userIndex].userid
}

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let messages = (uIndex: number) => {
  let userIndex = databaseCompleteUsers[uIndex]
  let messageIndices = messagesByUser[userIndex]
  return sortMessages(messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    district: databaseMessages[messageIndex].district,
    zone: databaseMessages[messageIndex].zone,
    index: databaseMessages[messageIndex].index,
    text: databaseMessages[messageIndex].text,
    color: databaseMessages[messageIndex].color,
    timestamp: databaseMessages[messageIndex].timestamp,
  })))
}

let rowCount = {
  users: databaseUsers.length,
  sessions: databaseSessions.length,
  messages: databaseMessages.length,
}

describe("testing endpoints...", () => {
  afterEach(async () => {
    let subscriber = await redisConn.getSubscriber()
    await subscriber.unsubscribe()
  })
  let testcases = [{
    tag: 1,
    args: `Bearer ${env.serviceid}:${sessionid(1)}`,
    expres: {
      status: 200,
      error: undefined,
      profile: profile(1),
      messages: messages(1),
      userid: userid(1),
    },
  }, {
    tag: 2,
    args: `Bearer ${env.serviceid}:${sessionid(3)}`,
    expres: {
      status: 200,
      error: undefined,
      profile: profile(3),
      messages: messages(3),
      userid: userid(3),
    },
  }, {
    tag: 3,
    args: `Bearer ${env.serviceid}:${examples.sessionid[2]}`,
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      profile: undefined,
      messages: undefined,
      userid: undefined,
    },
  }, {
    tag: 4,
    args: `Bearer ${env.serviceid}:abcd`,
    expres: {
      status: 401,
      error: "wrongValue.auth.sessionid",
      profile: undefined,
      messages: undefined,
      userid: undefined,
    },
  }, {
    tag: 5,
    args: `Bearer abcd:${examples.sessionid[2]}`,
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      profile: undefined,
      messages: undefined,
      userid: undefined,
    },
  }, {
    tag: 6,
    args: "abcd",
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      profile: undefined,
      messages: undefined,
      userid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`DELETE /profiles. Test #${tag}`, async () => {
      let userCount = expres.profile === undefined ? 0 : 1
      let msgCount = expres.messages?.length ?? 0
      let mReportsPromise = getReports("messages:deleted", userCount)
      let sReportsPromise = getReports("sessions:deleted", userCount)
      let result = await testServer.delete("/api/v1/profiles")
        .set("Authorization", args)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( result.body.messages !== undefined ) {
        result.body.messages = sortMessages(result.body.messages)
      }
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.profile).toStrictEqual(expres.profile)
        expect(result.body.messages).toStrictEqual(expres.messages)
        rowCount.users--
        rowCount.sessions--
        rowCount.messages -= expres.messages.length
      } else {
        expect(result.body.error).toStrictEqual(expres.error)
        expect(result.body.profile).toBeUndefined()
        expect(result.body.messages).toBeUndefined()
      }
      let userTable = await queryDatabase("SELECT * FROM users")
      let sessionTable = await queryDatabase("SELECT * FROM sessions")
      let messageTable = await queryDatabase("SELECT * FROM messages")
      expect(userTable).toBeDefined()
      expect(sessionTable).toBeDefined()
      expect(messageTable).toBeDefined()
      expect(userTable.rows).toHaveLength(rowCount.users)
      expect(sessionTable.rows).toHaveLength(rowCount.sessions)
      expect(messageTable.rows).toHaveLength(rowCount.messages)
      let mReports = await mReportsPromise
      expect(mReports).toHaveLength(userCount)
      for ( let i=0; i < mReports.length; i++ ) {
        expect(mReports[i].messageids).toBeDefined()
        expect(mReports[i].messageids).toHaveLength(msgCount)
        for ( let j=0; j < msgCount; j++ ) {
          expect(mReports[i].messageids[j].region).toBeDefined()
          expect(mReports[i].messageids[j].district).toBeDefined()
          expect(mReports[i].messageids[j].zone).toBeDefined()
          expect(mReports[i].messageids[j].index).toBeDefined()
          expect(mReports[i].messageids[j].text).toBeUndefined()
        }
      }
      let sReports = await sReportsPromise
      expect(sReports).toHaveLength(userCount)
      for ( let i=0; i < sReports.length; i++ ) {
        expect(sReports[i].userids).toBeDefined()
        expect(sReports[i].userids).toHaveLength(1)
        expect(sReports[i].userids[0]).toBe(expres.userid)
      }
    })
  }
})

