process.env.PG_SCHEMA = "createMessageTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createMessage } from "../../../lib/database/messages"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"

let correctData = {}

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
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("Function createMessage. Preparing database...", async () => {
    let args = {
      login: examples.login.correct[1],
      password: examples.password.correct[1],
      name: examples.name.correct[1],
    }
    let result = await createProfile(args)
    let table = await pool.query("SELECT userid FROM users")
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(table).toBeDefined()
    expect(table.rows).toHaveLength(1)
    expect(table.rows[0].userid).toMatch(patterns.uuid)
    correctData.userid = table.rows[0].userid
  })
  let testcases = [{
    tag: 1,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "success",
    }],
  }, {
    tag: 2,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.last,
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: examples.text.maxLen,
        color: examples.color.last,
      },
      expres: "success",
    }],
  }, {
    tag: 3,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.some,
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
        index: `${limits.messages.indexMin + 1}`,
        text: examples.text.regLen,
        color: examples.color.some,
      },
      expres: "success",
    }],
  }, {
    tag: 4,
    calls: [{
      wrongid: false,
      args: {
        region: "abcd",
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "wrongValues.messages.region",
    }],
  }, {
    tag: 5,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "wrongValues.messages.district",
    }],
  }, {
    tag: 6,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "wrongValues.messages.room",
    }],
  }, {
    tag: 7,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax + 1}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "wrongValues.messages.index",
    }],
  }, {
    tag: 8,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax}`,
        text: examples.text.tooShort,
        color: examples.color.first,
      },
      expres: "wrongValues.messages.text",
    }],
  }, {
    tag: 9,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax}`,
        text: examples.text.minLen,
        color: "abcd",
      },
      expres: "wrongValues.messages.color",
    }],
  }, {
    tag: 10,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "success",
    }, {
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "databaseConflicts.messageAlreadyExists",
    }],
  }, {
    tag: 11,
    calls: [{
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "success",
    }, {
      wrongid: false,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "success",
    }],
  }, {
    tag: 12,
    calls: [{
      wrongid: true,
      args: {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: examples.text.minLen,
        color: examples.color.first,
      },
      expres: "wrongValues.users.userid",
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, table, tag } = testcase
    test(`Function createMessage. Intg Test #${tag}`, async () => {
      let msgCount = 0
      let table = []
      for ( let call of calls ) {
        let { args, wrongid, expres } = call
        let id = !wrongid ? correctData.userid : "abcd"
        let result = await createMessage(id, args)
        if ( expres === "success" ) {
          expect(result.data).toBeDefined()
          expect(result.data.region).toBe(args.region)
          expect(`${result.data.district}`).toBe(args.district)
          expect(`${result.data.room}`).toBe(args.room) 
          expect(`${result.data.index}`).toBe(args.index)
          expect(result.data.text).toBe(args.text)
          expect(result.data.color).toBe(args.color)
          expect(result.data.timestamp).toMatch(patterns.timestamp)
          expect(result.error).toBeUndefined()
          msgCount++
          continue
        }
        expect(result.data).toBeUndefined()
        expect(result.error).toBe(expres)
      }
      let result = await pool.query("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(msgCount)
      for ( let i=0; i < msgCount; i++ ) {
        expect(limits.messages.regions).toContain(result.rows[i].region)
        expect(result.rows[i].district).toBeGreaterThanOrEqual(limits.messages.districtMin)
        expect(result.rows[i].district).toBeLessThanOrEqual(limits.messages.districtMax)
        expect(result.rows[i].room).toBeGreaterThanOrEqual(limits.messages.roomMin)
        expect(result.rows[i].room).toBeLessThanOrEqual(limits.messages.roomMax)
        expect(result.rows[i].index).toBeGreaterThanOrEqual(limits.messages.indexMin)
        expect(result.rows[i].index).toBeLessThanOrEqual(limits.messages.indexMax)
        expect(result.rows[i].text).toBeDefined()
        expect(limits.messages.colors).toContain(result.rows[i].color)
        expect(result.rows[i].userid).toMatch(patterns.uuid)
        expect(result.rows[i].timestamp).toMatch(patterns.timestamp)
      }
    })
  }
})


