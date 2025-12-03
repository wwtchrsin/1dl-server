process.env.PG_SCHEMA = "createProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
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

let databaseChecks = {
  userid: patterns.uuid,
  login: new RegExp(limits.users.loginPattern),
  password: patterns.passwordHash,
  name: new RegExp(`^.{${limits.users.nameLenMin},${limits.users.nameLenMax}}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: patterns.uuid,
  timestamp: patterns.timestamp,
}

let resultChecks = (args: any) => ({
  userid: patterns.uuid,
  login: new RegExp(`^${args.login}$`),
  name: new RegExp(`^${args.name}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: patterns.uuid,
  timestamp: patterns.timestamp,
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
  })
  let testcases = [{
    tag: 1,
    calls: [{
      args: {
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }],
  }, {
    tag: 2,
    calls: [{
      args: {
        login: examples.login.maxLen,
        password: examples.password.maxLen,
        name: examples.name.maxLen,
      },
      expres: "success",
    }],
  }, {
    tag: 3,
    calls: [{
      args: {
        login: examples.login.regLen,
        password: examples.password.regLen,
        name: examples.name.regLen,
      },
      expres: "success",
    }],
  }, {
    tag: 4,
    calls: [{
      args: {
        login: examples.login.tooShort,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "wrongValues.users.login",
    }],
  }, {
    tag: 5,
    calls: [{
      args: {
        login: examples.login.minLen,
        password: examples.password.tooShort,
        name: examples.name.minLen,
      },
      expres: "wrongValues.users.password",
    }],
  }, {
    tag: 6,
    calls: [{
      args: {
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.tooShort,
      },
      expres: "wrongValues.users.name",
    }],
  }, {
    tag: 7,
    calls: [{
      args: {
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }, {
      args: {
        login: examples.login.correct[1],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }],
  }, {
    tag: 8,
    calls: [{
      args: {
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }, {
      args: {
        login: examples.login.correct[0],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "databaseConflicts.loginTaken",
    }],
  }, {
    tag: 9,
    calls: [{
      args: {
        login: examples.login.correct[2],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }, {
      args: {
        login: examples.login.correct[2],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "databaseConflicts.loginTaken",
    }, {
      args: {
        login: examples.login.correct[3],
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: "success",
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, tag } = testcase
    test(`Function createProfile. Intg Test #${tag}`, async () => {
      let msgCount = 0
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await createProfile(args)
        if ( expres === "success" ) {
          let checks = resultChecks(args)
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.userid).toMatch(checks.userid)
          expect(result.data.name).toMatch(checks.name)
          expect(result.data.state).toMatch(checks.state)
          expect(result.data.puid).toMatch(checks.puid)
          expect(result.data.timestamp).toMatch(checks.timestamp)
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


