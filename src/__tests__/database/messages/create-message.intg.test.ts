import { pool, schema } from "../../../lib/database/conn"
import { createMessage } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions,
  databaseEmptyZones } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
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
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
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
          region: databaseEmptyZones[1].region,
          district: databaseEmptyZones[1].district,
          zone: databaseEmptyZones[1].zone,
          index: limits.message.index.min,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
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
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "databaseError.createMessage",
    }]
  }, {
    tag: 4,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: "abcd",
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "databaseError.createMessage",
    }]
  }, {
    tag: 5,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
        content: {
          text: examples.text.correct[0],
          color: "abcd",
        },
      },
      error: "databaseError.createMessage",
    }]
  }, {
    tag: 6,
    actions: [{
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
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
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min + 1,
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
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
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
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min,
        },
        content: {
          text: examples.text.correct[0],
          color: examples.color.first,
        },
      },
      error: "databaseConflict.messageAlreadyExists",
    }, {
      args: {
        userid: databaseSessions[0].userid,
        messageid: {
          region: databaseEmptyZones[0].region,
          district: databaseEmptyZones[0].district,
          zone: databaseEmptyZones[0].zone,
          index: limits.message.index.min + 1,
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
          expect(result.data.zone).toBe(messageid.zone)
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
        expect(limits.message.region.values).toContain(result.rows[i].region)
        expect(result.rows[i].district).toBeGreaterThanOrEqual(limits.message.district.min)
        expect(result.rows[i].district).toBeLessThanOrEqual(limits.message.district.max)
        expect(result.rows[i].zone).toBeGreaterThanOrEqual(limits.message.zone.min)
        expect(result.rows[i].zone).toBeLessThanOrEqual(limits.message.zone.max)
        expect(result.rows[i].index).toBeGreaterThanOrEqual(limits.message.index.min)
        expect(result.rows[i].index).toBeLessThanOrEqual(limits.message.index.max)
        expect(result.rows[i].text).toBeDefined()
        expect(limits.message.color.values).toContain(result.rows[i].color)
        expect(result.rows[i].userid).toMatch(patterns.uuid)
        expect(result.rows[i].timestamp).toMatch(patterns.timestamp)
      }
    })
  }
})


