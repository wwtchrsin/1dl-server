process.env.PG_SCHEMA = "getMessagesTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getMessages, createMessage } from "../../../lib/database/messages"
import { createUser } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

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
    },
    init: [[0, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    }], [1, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
      text: "2".repeat(limits.messages.textLenMax),
      color: limits.messages.colors[1],
    }], [0, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 2,
      text: "A".repeat(limits.messages.textLenMin + 1),
      color: limits.messages.colors[1],
    }]],
    expres: [],
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
    },
    init: [[1, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: "#".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[limits.messages.colors.length - 1],
    }], [1, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax - 1,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[limits.messages.colors.length - 2],
    }]],
    expres: [],
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    init: [[0, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: "&".repeat(limits.messages.textLenMax),
      color: limits.messages.colors[1],
    }], [0, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
      text: "@".repeat(limits.messages.textLenMax),
      color: limits.messages.colors[1],
    }], [1, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax - 2,
      text: "$".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    }], [0, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax,
      text: "%".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    }]],
    expres: [],
  }]
  test("Function createMessage. Preparing database...", async () => {
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
      let result = await createUser(user)
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
      for ( let data of init ) {
        let result = await createMessage(userids[data[0]], data[1])
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBe(data[1].region)
        expect(result.data.district).toBe(data[1].district)
        expect(result.data.room).toBe(data[1].room)
        expect(result.data.index).toBe(data[1].index)
        expect(result.data.text).toBe(data[1].text)
        expect(result.data.color).toBe(data[1].color)
        expect(result.data.timestamp).toBeDefined()
        expres.push({
          region: data[1].region,
          district: data[1].district,
          room: data[1].room,
          index: data[1].index,
          text: data[1].text,
          color: data[1].color,
          puid: puids[data[0]],
          username: usernames[data[0]],
          timestamp: result.data.timestamp,
        })
        msgCount++
      }
    }
    let result = await pool.query("SELECT * FROM messages")
    expect(result).toBeDefined()
    expect(result.rows).toHaveLength(msgCount)
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getMessages. Intg Test #${tag}`, async () => {
      let result = await getMessages(args)
      expect(result).toBeDefined()
      expect(result.error).toBeUndefined()
      expect(result.data).toHaveLength(expres.length)
      for ( let i=0; i < result.data.length; i++ ) {
        expect(result.data[i]).toBeDefined()
        expect(result.data[i].index).toBeDefined()
        let index = result.data[i].index
        let exp = expres.find(entry => entry.index === index)
        expect(exp).toBeDefined()
        expect(result.data[i]).toStrictEqual(exp)
      }
    })
  }
  let failures = [{
    tag: 4,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    expres: {
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin - 1,
      room: limits.messages.roomMin,
    },
    expres: {
      error: "wrongValues.messages.district",
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMax + 1,
    },
    expres: {
      error: "wrongValues.messages.room",
      data: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMax - 2,
      room: limits.messages.roomMax - 2,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }]
  for ( let testcase of failures ) {
    let { args, expres, tag } = testcase
    test(`Function getMessages. Intg Test #${tag}`, async () => {
      let result = await getMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})



