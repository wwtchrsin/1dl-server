process.env.PG_SCHEMA = "createMessageTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  let testcases = [{
    tag: 1,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }]
  }, {
    tag: 2,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.last,
          district: limits.messages.districtMax,
          room: limits.messages.roomMax,
          index: limits.messages.indexMax,
        },
        content: {
          text: examples.text.correct[1],
          color: examples.color.last,
        },
      },
      error: undefined,
    }]
  }, {
    tag: 3,
    actions: [{
      args: {
        userid: "abcd",
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "wrongValues.users.userid",
    }]
  }, {
    tag: 4,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: "abcd",
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "wrongValues.messages.region",
    }]
  }, {
    tag: 5,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: "abcd",
        },
      },
      error: "wrongValues.messages.color",
    }]
  }, {
    tag: 6,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }, {
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin + 1,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }]
  }, {
    tag: 7,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }, {
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "databaseConflicts.messageAlreadyExists",
    }]
  }, {
    tag: 8,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }, {
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "databaseConflicts.messageAlreadyExists",
    }, {
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: examples.region.first,
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
          index: limits.messages.indexMin + 1,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: undefined,
    }]
  }]
  for ( let testcase of testcases ) {
    let { actions, tag } = testcase
    test(`Function createMessage. Intg Test #${tag}`, async () => {
      let msgCount = 0
      for ( let action of actions ) {
        let { args, error } = action
        let { userid, messageid, content } = args
        let result = await createMessage(userid, messageid, content)
        if ( error === undefined ) {
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.region).toBe(messageid.region)
          expect(result.data.district).toBe(messageid.district)
          expect(result.data.room).toBe(messageid.room)
          expect(result.data.index).toBe(messageid.index)
          expect(result.data.text).toBe(content.text)
          expect(result.data.color).toBe(content.color)
          expect(result.data.timestamp).toMatch(patterns.timestamp)
          msgCount++
        } else {
          expect(result.error).toBe(error)
          expect(result.data).toBeUndefined()
        }
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


