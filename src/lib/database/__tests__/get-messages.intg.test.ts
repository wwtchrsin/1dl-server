process.env.PG_SCHEMA = "getMessagesTest"

import { pool, queryDatabase } from "../conn"
import { getMessages, createMessage } from "../messages"
import { createUser } from "../users"
import { sql } from "../schema"
import limits from "../limits"
import { databaseErrors, databaseConflicts } from "../../error-messages"
import { wrongValues } from "../../error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let useridPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/
let timestampPattern = /^[1-9][0-9]{9,10}$/

let messages = []

describe("testing database queries...", () => {
  let userids = []
  let usernames = []
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    expres: [[0, {
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
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
    },
    expres: [[1, {
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
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    },
    expres: [[0, {
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
    }]]
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
    expect(true).toBe(true)
    for ( let user of users ) {
      let result = await createUser(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(useridPattern)
      userids.push(result.data.userid)
      usernames.push(user.name)
    }
    
    let msgCount = 0
    for ( let testcase of testcases ) {
      let { expres } = testcase 
      for ( let data of expres ) {
        let result = await createMessage(userids[data[0]], data[1])
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBeDefined()
        expect(result.data.district).toBeDefined()
        expect(result.data.room).toBeDefined()
        expect(result.data.index).toBeDefined()
        expect(result.data.text).toBeDefined()
        expect(result.data.timestamp).toBeDefined()
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
        let exp = expres.find(entry => entry[1].index === index)[1]
        expect(exp).toBeDefined()
        expect(result.data[i].region).toBe(exp.region)
        expect(result.data[i].district).toBe(exp.district)
        expect(result.data[i].room).toBe(exp.room)
        expect(result.data[i].text).toBe(exp.text)
        expect(result.data[i].timestamp).toMatch(timestampPattern)
        expect(result.data[i].username).toBe(usernames[expres[i][0]])
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
      error: wrongValues.messages.region,
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
      error: wrongValues.messages.district,
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
      error: wrongValues.messages.room,
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



