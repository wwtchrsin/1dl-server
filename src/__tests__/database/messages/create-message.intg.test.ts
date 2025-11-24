process.env.PG_SCHEMA = "createMessageTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createMessage } from "../../../lib/database/messages"
import { createUser } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

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

let resultChecks = (args: any) => ({
  region: new RegExp(`^${args.region}$`),
  district: new RegExp(`^${args.district}$`),
  room: new RegExp(`^${args.room}$`),
  index: new RegExp(`^${args.index}$`),
  text: new RegExp(`^${args.text}$`),
  color: new RegExp(`^${args.color}$`),
  timestamp: limits.patterns.timestamp,
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("Function createMessage. Preparing database...", async () => {
    let args = {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: username,
    }
    let result = await createUser(args)
    let table = await pool.query("SELECT userid FROM users")
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(table).toBeDefined()
    expect(table.rows).toHaveLength(1)
    expect(table.rows[0].userid).toMatch(limits.patterns.uuid)
    userid = table.rows[0].userid
  })
  let testcases = [{
    tag: 1,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: "success",
    }],
  }, {
    tag: 2,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
      expres: "success",
    }],
  }, {
    tag: 3,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
        index: `${limits.messages.indexMin + 1}`,
        text: "1".repeat(limits.messages.textLenMin + 1),
        color: limits.messages.colors[1],
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
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.messages.region,
        data: undefined,
      }
    }],
  }, {
    tag: 5,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.messages.district,
        data: undefined,
      }
    }],
  }, {
    tag: 6,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.messages.room,
        data: undefined,
      }
    }],
  }, {
    tag: 7,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax + 1}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.messages.index,
        data: undefined,
      }
    }],
  }, {
    tag: 8,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax + 1),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.messages.text,
        data: undefined,
      }
    }],
  }, {
    tag: 9,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: "abcd",
      },
      expres: {
        error: wrongValues.messages.color,
        data: undefined,
      }
    }],
  }, {
    tag: 10,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "2".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[1],
      },
      expres: "success",
    }, {
      wrongid: false,
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: databaseConflicts.messageAlreadyExists,
        data: undefined,
      },
    }],
  }, {
    tag: 11,
    calls: [{
      wrongid: false,
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: "success",
    }, {
      wrongid: false,
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
        text: "2".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[1],
      },
      expres: "success",
    }],
  }, {
    tag: 12,
    calls: [{
      wrongid: true,
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: wrongValues.users.userid,
        data: undefined,
      }
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, table, tag } = testcase
    test(`Function createMessage. Intg Test #${tag}`, async () => {
      let msgCount = 0
      let table = []
      for ( let call of calls ) {
        let { args, wrongid, expres } = call
        let id = !wrongid ? userid : "abcd"
        let result = await createMessage(id, args)
        if ( expres === "success" ) {
          let checks = resultChecks(args)
          expect(result.data).toBeDefined()
          expect(result.data.region).toMatch(checks.region)
          expect(`${result.data.district}`).toMatch(checks.district)
          expect(`${result.data.room}`).toMatch(checks.room) 
          expect(`${result.data.index}`).toMatch(checks.index)
          expect(result.data.text).toMatch(checks.text)
          expect(result.data.color).toMatch(checks.color)
          expect(result.data.timestamp).toMatch(checks.timestamp)
          expect(result.error).toBeUndefined()
          msgCount++
          continue
        }
        expect(result).toStrictEqual(expres)
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
        expect(result.rows[i].userid).toMatch(limits.patterns.uuid)
        expect(result.rows[i].timestamp).toMatch(limits.patterns.timestamp)
      }
    })
  }
})


