process.env.PG_SCHEMA = "createProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let databaseChecks = {
  userid: patterns.uuid,
  login: new RegExp(limits.users.loginPattern),
  password: patterns.passwordHash,
  name: new RegExp(`^.{${limits.users.nameLenMin},${limits.users.nameLenMax}}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: patterns.uuid,
  timestamp: patterns.timestamp,
}

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
  })
  let testcases = [{
    tag: 1,
    actions: [{
      args: [{
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }],
  }, {
    tag: 2,
    actions: [{
      args: [{
        login: examples.login.maxLen,
        password: examples.password.maxLen,
        name: examples.name.maxLen,
      }, "active"],
      expres: "success",
    }],
  }, {
    tag: 3,
    actions: [{
      args: [{
        login: examples.login.regLen,
        password: examples.password.regLen,
        name: examples.name.regLen,
      }, "active"],
      expres: "success",
    }],
  }, {
    tag: 4,
    actions: [{
      args: [{
        login: examples.login.tooShort,
        password: examples.password.regLen,
        name: examples.name.regLen,
      }, "active"],
      expres: "databaseErrors.createProfile",
    }],
  }, {
    tag: 5,
    actions: [{
      args: [{
        login: examples.login.regLen,
        password: examples.password.noDigits,
        name: examples.name.regLen,
      }, "active"],
      expres: "success",
    }],
  }, {
    tag: 6,
    actions: [{
      args: [{
        login: examples.login.regLen,
        password: examples.password.regLen,
        name: examples.name.tooLong,
      }, "active"],
      expres: "databaseErrors.createProfile",
    }],
  }, {
    tag: 7,
    actions: [{
      args: [{
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }, {
      args: [{
        login: examples.login.correct[1],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }],
  }, {
    tag: 8,
    actions: [{
      args: [{
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }, {
      args: [{
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "databaseConflicts.loginTaken",
    }],
  }, {
    tag: 9,
    actions: [{
      args: [{
        login: examples.login.correct[2],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }, {
      args: [{
        login: examples.login.correct[2],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "databaseConflicts.loginTaken",
    }, {
      args: [{
        login: examples.login.correct[3],
        password: examples.password.minLen,
        name: examples.name.minLen,
      }, "active"],
      expres: "success",
    }],
  }]
  for ( let testcase of testcases ) {
    let { actions, tag } = testcase
    test(`Function createProfile. Intg Test #${tag}`, async () => {
      let msgCount = 0
      for ( let action of actions ) {
        let { args, expres } = action
        let result = await createProfile(...args)
        if ( expres === "success" ) {
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.userid).toMatch(patterns.uuid)
          expect(result.data.login).toBe(args[0].login)
          expect(result.data.name).toBe(args[0].name)
          expect(result.data.state).toBeDefined()
          expect(result.data.puid).toMatch(patterns.uuid)
          expect(result.data.timestamp).toMatch(patterns.timestamp)
          msgCount++
          continue
        }
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
      let result = await pool.query("SELECT * FROM users")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(msgCount)
      for ( let i=0; i < msgCount; i++ ) {
        expect(result.rows[i].userid).toMatch(databaseChecks.userid)
        expect(result.rows[i].login).toMatch(databaseChecks.login)
        expect(result.rows[i].password).toMatch(databaseChecks.password)
        expect(result.rows[i].name).toMatch(databaseChecks.name)
        expect(result.rows[i].state).toMatch(databaseChecks.state)
        expect(result.rows[i].puid).toMatch(databaseChecks.puid)
        expect(result.rows[i].timestamp).toMatch(databaseChecks.timestamp)
      }
    })
  }
})


