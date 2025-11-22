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
let useridPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/
let timestampPattern = /^[1-9][0-9]{9,10}$/

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
    expect(table.rows[0].userid).toMatch(useridPattern)
    userid = table.rows[0].userid
  })
  let testcases = [{
    tag: 1,
    calls: [{
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[0] + "$"),
          district: new RegExp("^" + limits.messages.districtMin + "$"),
          room: new RegExp("^" + limits.messages.roomMin + "$"),
          index: new RegExp("^" + limits.messages.indexMin + "$"),
          text: new RegExp("^" + "1".repeat(limits.messages.textLenMin) + "$"),
          color: new RegExp("^" + limits.messages.colors[0] + "$"),
          timestamp: timestampPattern,
        },
      }
    }],
    table: [{
      region: new RegExp("^" + limits.messages.regions[0] + "$"),
      district: new RegExp("^" + limits.messages.districtMin + "$"),
      room: new RegExp("^" + limits.messages.roomMin + "$"),
      index: new RegExp("^" + limits.messages.indexMin + "$"),
      text: new RegExp("^" + "1".repeat(limits.messages.textLenMin) + "$"),
      color: new RegExp("^" + limits.messages.colors[0] + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 2,
    calls: [{
      args: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[limits.messages.regions.length - 1] + "$"),
          district: new RegExp("^" + limits.messages.districtMax + "$"),
          room: new RegExp("^" + limits.messages.roomMax + "$"),
          index: new RegExp("^" + limits.messages.indexMax + "$"),
          text: new RegExp("^" + "1".repeat(limits.messages.textLenMax) + "$"),
          color: new RegExp("^" + limits.messages.colors[limits.messages.colors.length - 1] + "$"),
          timestamp: timestampPattern,
        },
      }
    }],
    table: [{
      region: new RegExp("^" + limits.messages.regions[limits.messages.regions.length - 1] + "$"),
      district: new RegExp("^" + limits.messages.districtMax + "$"),
      room: new RegExp("^" + limits.messages.roomMax + "$"),
      index: new RegExp("^" + limits.messages.indexMax + "$"),
      text: new RegExp("^" + "1".repeat(limits.messages.textLenMax) + "$"),
      color: new RegExp("^" + limits.messages.colors[limits.messages.colors.length - 1] + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 3,
    calls: [{
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
        index: `${limits.messages.indexMin + 1}`,
        text: "1".repeat(limits.messages.textLenMin + 1),
        color: limits.messages.colors[1],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[1] + "$"),
          district: new RegExp("^" + (limits.messages.districtMin+1) + "$"),
          room: new RegExp("^" + (limits.messages.roomMin+1) + "$"),
          index: new RegExp("^" + (limits.messages.indexMin+1) + "$"),
          text: new RegExp("^" + "1".repeat(limits.messages.textLenMin+1) + "$"),
          color: new RegExp("^" + limits.messages.colors[1] + "$"),
          timestamp: timestampPattern,
        },
      }
    }],
    table: [{
      region: new RegExp("^" + limits.messages.regions[1] + "$"),
      district: new RegExp("^" + (limits.messages.districtMin+1) + "$"),
      room: new RegExp("^" + (limits.messages.roomMin+1) + "$"),
      index: new RegExp("^" + (limits.messages.indexMin+1) + "$"),
      text: new RegExp("^" + "1".repeat(limits.messages.textLenMin+1) + "$"),
      color: new RegExp("^" + limits.messages.colors[1] + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 4,
    calls: [{
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
    table: [],
  }, {
    tag: 5,
    calls: [{
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
    table: [],
  }, {
    tag: 6,
    calls: [{
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
    table: [],
  }, {
    tag: 7,
    calls: [{
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
    table: [],
  }, {
    tag: 8,
    calls: [{
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
    table: [],
  }, {
    tag: 9,
    calls: [{
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
    table: [],
  }, {
    tag: 10,
    calls: [{
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "2".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[1],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[0] + "$"),
          district: new RegExp("^" + limits.messages.districtMin + "$"),
          room: new RegExp("^" + limits.messages.roomMin + "$"),
          index: new RegExp("^" + limits.messages.indexMin + "$"),
          text: new RegExp("^" + "2".repeat(limits.messages.textLenMin) + "$"),
          color: new RegExp("^" + limits.messages.colors[1] + "$"),
          timestamp: timestampPattern,
        },
      }
    }, {
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
    table: [{
      region: new RegExp("^" + limits.messages.regions[0] + "$"),
      district: new RegExp("^" + limits.messages.districtMin + "$"),
      room: new RegExp("^" + limits.messages.roomMin + "$"),
      index: new RegExp("^" + limits.messages.indexMin + "$"),
      text: new RegExp("^" + "2".repeat(limits.messages.textLenMin) + "$"),
      color: new RegExp("^" + limits.messages.colors[1] + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 11,
    calls: [{
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[0] + "$"),
          district: new RegExp("^" + limits.messages.districtMin + "$"),
          room: new RegExp("^" + limits.messages.roomMin + "$"),
          index: new RegExp("^" + limits.messages.indexMin + "$"),
          text: new RegExp("^" + "1".repeat(limits.messages.textLenMin) + "$"),
          color: new RegExp("^" + limits.messages.colors[0] + "$"),
          timestamp: timestampPattern,
        },
      }
    }, {
      args: {
        region: limits.messages.regions[1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin + 1}`,
        text: "2".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[1],
      },
      expres: {
        error: undefined,
        data: {
          region: new RegExp("^" + limits.messages.regions[1] + "$"),
          district: new RegExp("^" + limits.messages.districtMin + "$"),
          room: new RegExp("^" + limits.messages.roomMin + "$"),
          index: new RegExp("^" + (limits.messages.indexMin+1) + "$"),
          text: new RegExp("^" + "2".repeat(limits.messages.textLenMin) + "$"),
          color: new RegExp("^" + limits.messages.colors[1] + "$"),
          timestamp: timestampPattern,
        },
      },
    }],
    table: [{
      region: new RegExp("^" + limits.messages.regions[0] + "$"),
      district: new RegExp("^" + limits.messages.districtMin + "$"),
      room: new RegExp("^" + limits.messages.roomMin + "$"),
      index: new RegExp("^" + limits.messages.indexMin + "$"),
      text: new RegExp("^" + "1".repeat(limits.messages.textLenMin) + "$"),
      color: new RegExp("^" + limits.messages.colors[0] + "$"),
      timestamp: timestampPattern,
    }, {
      region: new RegExp("^" + limits.messages.regions[1] + "$"),
      district: new RegExp("^" + limits.messages.districtMin + "$"),
      room: new RegExp("^" + limits.messages.roomMin + "$"),
      index: new RegExp("^" + (limits.messages.indexMin+1) + "$"),
      text: new RegExp("^" + "2".repeat(limits.messages.textLenMin) + "$"),
      color: new RegExp("^" + limits.messages.colors[1] + "$"),
      timestamp: timestampPattern,
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, table, tag } = testcase
    test(`Function createMessage. Intg Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await createMessage(userid, args)
        expect(result.error).toStrictEqual(expres.error)
        if ( expres.data === undefined ) {
          expect(result.data).toBeUndefined()
          continue
        }
        expect(result.data).toBeDefined()
        for ( let column in expres.data ) {
          expect(`${result.data[column]}`).toMatch(expres.data[column])
        }
      }
      let result = await pool.query("SELECT * FROM messages")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(table.length)
      for ( let i=0; i < table.length; i++ ) {
        for ( let column in table[i] ) {
          expect(`${result.rows[i][column]}`).toMatch(table[i][column])
        }
      }
    })
  }
})


