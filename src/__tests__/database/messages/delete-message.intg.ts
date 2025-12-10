process.env.PG_SCHEMA = "deleteMessageTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createMessage, deleteMessage } from "../../../lib/database/messages"
import { createProfile } from "../../../lib/database/users"
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

let knownUserids = []

let unknownUserid = examples.uuid[0]

let messages = [{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[0],
  color: examples.color.first,
}, {
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 1,
  text: examples.text.correct[1],
  color: examples.color.first,
}, {
  region: examples.region.last,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[2],
  color: examples.color.last,
}]

let unknownMessageid = {
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin + 5,
}

let wrongRegionMessageid = {
  region: "abcd",
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
}

let getMessageid = (message: any) => ({
  region: message.region,
  district: message.district,
  room: message.room,
  index: message.index,
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("Function deleteMessage. Preparing database...", async () => {
    let profiles = [{
      login: examples.login.correct[2],
      password: examples.password.correct[2],
      name: examples.name.correct[2],
    }, {
      login: examples.login.correct[3],
      password: examples.password.correct[3],
      name: examples.name.correct[3],
    }]
    for ( let i=0; i < profiles.length; i++ ) {
      let result = await createProfile(profiles[i], "active")
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(patterns.uuid)
      knownUserids[i] = result.data.userid
    }
  })
  let testcases = [{
    tag: 1,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[0], getMessageid(messages[0])],
      expres: "success",
    }],
  }, {
    tag: 2,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[1], getMessageid(messages[2])],
      expres: "success",
    }],
  }, {
    tag: 3,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
    ],
    actions: [{
      args: () => [knownUserids[1], getMessageid(messages[2])],
      expres: "databaseConflicts.messageNotFound",
    }],
  }, {
    tag: 4,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [unknownUserid, getMessageid(messages[0])],
      expres: "databaseConflicts.messageNotFound",
    }],
  }, {
    tag: 5,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[0], unknownMessageid],
      expres: "databaseConflicts.messageNotFound",
    }],
  }, {
    tag: 6,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => ["abcd", getMessageid(messages[0])],
      expres: "wrongValues.users.userid",
    }],
  }, {
    tag: 7,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[0], wrongRegionMessageid],
      expres: "wrongValues.messages.region",
    }],
  }, {
    tag: 8,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[0], getMessageid(messages[0])],
      expres: "success",
    }, {
      args: () => [knownUserids[1], getMessageid(messages[2])],
      expres: "success",
    }],
  }, {
    tag: 9,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[1], getMessageid(messages[0])],
      expres: "databaseConflicts.messageNotFound",
    }, {
      args: () => [knownUserids[0], getMessageid(messages[2])],
      expres: "databaseConflicts.messageNotFound",
    }, {
      args: () => [knownUserids[0], getMessageid(messages[1])],
      expres: "success",
    }],
  }, {
    tag: 10,
    init: [
      () => [knownUserids[0], messages[0]],
      () => [knownUserids[0], messages[1]],
      () => [knownUserids[1], messages[2]],
    ],
    actions: [{
      args: () => [knownUserids[0], getMessageid(messages[0])],
      expres: "success",
    }, {
      args: () => [knownUserids[0], getMessageid(messages[1])],
      expres: "success",
    }, {
      args: () => [knownUserids[1], getMessageid(messages[2])],
      expres: "success",
    }],
  }]
  for ( let testcase of testcases ) {
    let { init, actions, tag } = testcase
    test(`Function deleteMessage. Intg Test #${tag}`, async () => {
      for ( let args of init ) {
        let [ userid, messageid ] = args()
        let result = await createMessage(userid, messageid)
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBe(messageid.region)
        expect(result.data.district).toBe(messageid.district)
        expect(result.data.room).toBe(messageid.room)
        expect(result.data.index).toBe(messageid.index)
      }
      let rowCount = init.length
      for ( let action of actions ) {
        let { args, expres } = action
        let [ userid, messageid ] = args()
        let result = await deleteMessage(userid, messageid)
        if ( expres === "success" ) {
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.region).toBe(messageid.region)
          expect(result.data.district).toBe(messageid.district)
          expect(result.data.room).toBe(messageid.room)
          expect(result.data.index).toBe(messageid.index)
          expect(result.data.text).toBeDefined()
          expect(result.data.color).toBeDefined()
          expect(result.data.timestamp).toBeDefined()
          rowCount--
        } else {
          expect(result.error).toBe(expres)
          expect(result.data).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
    })
  }
})

    
      
    



