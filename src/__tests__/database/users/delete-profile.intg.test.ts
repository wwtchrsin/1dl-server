process.env.PG_SCHEMA = "deleteProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { deleteProfile, createSession, createProfile } from "../../../lib/database/users"
import { createMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let profiles = [{
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.name.correct[0],
}, {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
  name: examples.name.correct[1],
}]

let knownUserids = []

let unknownUserid = examples.uuid[0]

let messages = [[[{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
}, {
  text: examples.text.correct[0],
  color: examples.color.first,
}], [{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 1,
}, {
  text: examples.text.correct[1],
  color: examples.color.first,
}]], [[{
  region: examples.region.last,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
}, {
  text: examples.text.correct[2],
  color: examples.color.last,
}]]]

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
    await pool.query("DELETE FROM messages")
    await pool.query("DELETE FROM users")
  })
  let testcases = [{
    tag: 1,
    args: () => knownUserids[0],
    expres: {
      error: undefined,
      profile: profiles[0],
      messages: messages[0],
    },
    exprows: {
      users: 1,
      messages: 1,
      sessions: 1,
    },
  }, {
    tag: 2,
    args: () => knownUserids[1],
    expres: {
      error: undefined,
      profile: profiles[1],
      messages: messages[1],
    },
    exprows: {
      users: 1,
      messages: 2,
      sessions: 1,
    },
  }, {
    tag: 3,
    args: () => unknownUserid,
    expres: {
      error: "databaseConflicts.profileNotFound",
      profile: undefined,
      messages: undefined,
    },
    exprows: {
      users: 2,
      messages: 3,
      sessions: 2,
    },
  }, {
    tag: 4,
    args: () => "abcd",
    expres: {
      error: "wrongValues.users.userid",
      profile: undefined,
      messages: undefined,
    },
    exprows: {
      users: 2,
      messages: 3,
      sessions: 2,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, exprows, tag } = testcase
    test(`Function deleteProfile. Intg Test #${tag}`, async () => {
      for ( let i=0; i < profiles.length; i++ ) {
        let result = await createProfile(profiles[i], "active")
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toMatch(patterns.uuid)
        knownUserids[i] = result.data.userid
      }
      for ( let i=0; i < profiles.length; i++ ) {
        let result = await createSession({ 
          login: profiles[i].login,
          password: profiles[i].password,
        })
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(patterns.sessionid)
      }
      for ( let i=0; i < messages.length; i++ ) {
        for ( let j=0; j < messages[i].length; j++ ) {
          let result = await createMessage(knownUserids[i], messages[i][j][0], messages[i][j][1])
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.text).toBe(messages[i][j][1].text)
        }
      }
      let result = await deleteProfile(args())
      expect(result.error).toBe(expres.error)
      if ( expres.error === undefined ) {
        expect(result.profile).toBeDefined()
        expect(result.profile.login).toBe(expres.profile.login)
        expect(result.profile.name).toBe(expres.profile.name)
        expect(result.profile.state).toBeDefined()
        expect(result.profile.timestamp).toMatch(patterns.timestamp)
        expect(result.messages).toBeDefined()
        expect(result.messages).toHaveLength(expres.messages.length)
        for ( let i=0; i < expres.messages.length; i++ ) {
          expect(result.messages[i].region).toBeDefined()
          expect(result.messages[i].district).toBeDefined()
          expect(result.messages[i].room).toBeDefined()
          expect(result.messages[i].index).toBeDefined()
          expect(result.messages[i].text).toBeDefined()
          expect(result.messages[i].color).toBeDefined()
          expect(result.messages[i].timestamp).toBeDefined()
        }
      } else {
        expect(result.profile).toBeUndefined()
        expect(result.messages).toBeUndefined()
      }
      let sessionsTable = await queryDatabase("SELECT FROM sessions")
      let messagesTable = await queryDatabase("SELECT FROM messages")
      let usersTable = await queryDatabase("SELECT FROM users")
      expect(sessionsTable).toBeDefined()
      expect(sessionsTable.rows).toHaveLength(exprows.sessions)
      expect(messagesTable).toBeDefined()
      expect(messagesTable.rows).toHaveLength(exprows.messages)
      expect(usersTable).toBeDefined()
      expect(usersTable.rows).toHaveLength(exprows.users)
    })
  }
})


        
    

