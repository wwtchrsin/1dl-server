import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { deleteProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions, sessionByUser,
  databaseUsers, messagesByUser, databaseMessages } from "../../../lib/test-data"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addSessions)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let getProfile = (userIndex: number) => {
  let user = databaseUsers[userIndex]
  return {
    userid: user.userid,
    region: user.region,
    login: user.login,
    name: user.name,
    state: user.state,
    puid: user.puid,
    timestamp: user.timestamp,
  }
}

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1)
}

let getMessages = (userIndex: number) => {
  let messageIndices = messagesByUser[userIndex]
  return sortMessages(messageIndices.map(messageIndex => {
    let message = databaseMessages[messageIndex]
    return {
      region: message.region,
      tag: message.tag,
      index: message.index,
      text: message.text,
      color: message.color,
      timestamp: message.timestamp,
    }
  }))
}

let getDeviceid = (userIndex: number) => {
  let sessionIndex = sessionByUser[userIndex]
  if ( sessionIndex === undefined ) {
    return undefined
  }
  return databaseSessions[sessionIndex].deviceid
}

let getMessageCount = (userIndex: number) => {
  return messagesByUser[userIndex].length
}

let rowCount = {
  users: databaseUsers.length,
  sessions: databaseSessions.length,
  messages: databaseMessages.length,
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: databaseUsers[0].userid,
    expres: {
      error: undefined,
      profile: getProfile(0),
      messages: getMessages(0),
      deviceid: getDeviceid(0),
    },
    rowCount: {
      users: 1,
      messages: getMessageCount(0),
      sessions: 1,
    },
  }, {
    tag: 2,
    args: databaseUsers[2].userid,
    expres: {
      error: undefined,
      profile: getProfile(2),
      messages: getMessages(2),
      deviceid: getDeviceid(2),
    },
    rowCount: {
      users: 1,
      messages: getMessageCount(2),
      sessions: 1,
    },
  }, {
    tag: 3,
    args: databaseUsers[0].userid,
    expres: {
      error: "databaseConflict.profileNotFound",
      profile: undefined,
      messages: undefined,
      deviceid: undefined,
    },
    rowCount: {
      users: 0,
      messages: 0,
      sessions: 0,
    },
  }, {
    tag: 4,
    args: examples.uuid[0],
    expres: {
      error: "databaseConflict.profileNotFound",
      profile: undefined,
      messages: undefined,
      deviceid: undefined,
    },
    rowCount: {
      users: 0,
      messages: 0,
      sessions: 0,
    },
  }, {
    tag: 5,
    args: "abcd",
    expres: {
      error: "databaseError.getProfile",
      profile: undefined,
      messages: undefined,
      deviceid: undefined,
    },
    rowCount: {
      users: 0,
      messages: 0,
      sessions: 0,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function deleteProfile. Intg Test #${tag}`, async () => {
      let result = await deleteProfile(args)
      if ( result.messages !== undefined ) {
        result.messages = sortMessages(result.messages)
      }
      expect(result).toStrictEqual(expres)
      rowCount.users -= testcase.rowCount.users
      rowCount.sessions -= testcase.rowCount.sessions
      rowCount.messages -= testcase.rowCount.messages
      let sessionsTable = await queryDatabase("SELECT FROM sessions")
      let messagesTable = await queryDatabase("SELECT FROM messages")
      let usersTable = await queryDatabase("SELECT FROM users")
      expect(usersTable).toBeDefined()
      expect(sessionsTable).toBeDefined()
      expect(messagesTable).toBeDefined()
      expect(usersTable.rows).toHaveLength(rowCount.users)
      expect(sessionsTable.rows).toHaveLength(rowCount.sessions)
      expect(messagesTable.rows).toHaveLength(rowCount.messages)
    })
  }
})


        
    

