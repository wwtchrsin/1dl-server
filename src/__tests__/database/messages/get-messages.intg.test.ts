process.env.PG_SCHEMA = "getMessagesTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getMessages, createMessage } from "../../../lib/database/messages"
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

describe("testing database queries...", () => {
  let userids = []
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    init: [[0, {
      region: examples.region.first,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: examples.text.correct[0],
      color: examples.color.first,
    }], [1, {
      region: examples.region.first,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
      text: examples.text.correct[1],
      color: examples.color.some,
    }], [0, {
      region: examples.region.first,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 2,
      text: examples.text.correct[2],
      color: examples.color.some,
    }]],
    expres: [],
  }, {
    tag: 2,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
    },
    init: [[1, {
      region: examples.region.first,
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: examples.text.minLen,
      color: examples.color.last,
    }], [1, {
      region: examples.region.first,
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax - 1,
      text: examples.text.maxLen,
      color: examples.color.last,
    }]],
    expres: [],
  }, {
    tag: 3,
    args: {
      region: examples.region.some,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    init: [[0, {
      region: examples.region.some,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
      text: examples.text.regLen,
      color: examples.color.some,
    }], [0, {
      region: examples.region.some,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
      text: examples.text.correct[3],
      color: examples.color.some,
    }], [1, {
      region: examples.region.some,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax - 2,
      text: examples.text.correct[2],
      color: examples.color.first,
    }], [0, {
      region: examples.region.some,
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMax,
      text: examples.text.correct[1],
      color: examples.color.first,
    }]],
    expres: [],
  }]
  test("Function createMessage. Preparing database...", async () => {
    let users = [{
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    }, {
      login: examples.login.correct[1],
      password: examples.password.correct[1],
      name: examples.name.correct[1],
    }]
    let puids = []
    let usernames = []
    for ( let user of users ) {
      let result = await createProfile(user, "active")
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(patterns.uuid)
      expect(result.data.puid).toMatch(patterns.uuid)
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
      region: examples.region.first,
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
      region: examples.region.first,
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
      region: examples.region.first,
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



