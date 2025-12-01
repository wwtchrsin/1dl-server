process.env.PG_SCHEMA = "getMessageTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createMessage, getMessage } from "../../../lib/database/messages"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"

let userid = ""
let username = "abcd 123"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  let userids = []
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    init: [0, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    }],
    expres: [],
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: limits.messages.districtMax,
      room: limits.messages.roomMax,
      index: limits.messages.indexMax,
    },
    init: [1, {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: limits.messages.districtMax,
      room: limits.messages.roomMax,
      index: limits.messages.indexMax,
      text: "1".repeat(limits.messages.textLenMax),
      color: limits.messages.colors[limits.messages.colors.length - 1],
    }],
    expres: [],
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 1,
    },
    init: [0, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 1,
      text: "1".repeat(limits.messages.textLenMin + 1),
      color: limits.messages.colors[1],
    }],
    expres: [],
  }]
  test("Function getMessage. Preparing database...", async () => {
    let users = [{
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    }, {
      login: "2".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "2".repeat(limits.users.nameLenMin),
    }]
    let puids = []
    let usernames = []
    for ( let user of users ) {
      let result = await createProfile(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(limits.patterns.uuid)
      expect(result.data.puid).toMatch(limits.patterns.uuid)
      userids.push(result.data.userid)
      puids.push(result.data.puid)
      usernames.push(user.name)
    }
    let msgCount = 0
    for ( let testcase of testcases ) {
      let { init, expres } = testcase
      let result = await createMessage(userids[init[0]], init[1])
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.region).toBe(init[1].region)
      expect(result.data.district).toBe(init[1].district)
      expect(result.data.room).toBe(init[1].room)
      expect(result.data.index).toBe(init[1].index)
      expect(result.data.text).toBe(init[1].text)
      expect(result.data.color).toBe(init[1].color)
      expect(result.data.timestamp).toBeDefined()
      expres.push({
        region: init[1].region,
        district: init[1].district,
        room: init[1].room,
        index: init[1].index,
        text: init[1].text,
        color: init[1].color,
        puid: puids[init[0]],
        username: usernames[init[0]],
        timestamp: result.data.timestamp,
      })
      msgCount++
    }
    let result = await pool.query("SELECT * FROM messages")
    expect(result).toBeDefined()
    expect(result.rows).toHaveLength(msgCount)
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getMessage. Intg Test #${tag}`, async () => {
      let result = await getMessage(args)
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
      expect(result.data).toStrictEqual(expres[0])
    })
  }
  let failures = [{
    tag: 4,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    expres: "wrongValues.messages.region",
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin - 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin - 1,
      index: limits.messages.indexMin,
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax + 1,
    },
    expres: "wrongValues.messages.index",
  }, {
    tag: 8,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMax - 2,
      room: limits.messages.roomMin + 2,
      index: limits.messages.indexMax - 2,
    },
    expres: "databaseConflicts.messageNotFound",
  }]
  for ( let testcase of failures ) {
    let { args, expres, tag } = testcase
    test(`Function getMessage. Intg Test #${tag}`, async () => {
      let result = await getMessage(args)
      expect(result.error).toStrictEqual(expres)
      expect(result.data).toBeUndefined()
    })
  }
})
        
    
    
