process.env.PG_SCHEMA = "createProfileTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let databaseChecks = {
  userid: limits.patterns.uuid,
  login: new RegExp(limits.users.loginPattern),
  password: limits.patterns.passwordHash,
  name: new RegExp(`^.{${limits.users.nameLenMin},${limits.users.nameLenMax}}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: limits.patterns.uuid,
  timestamp: limits.patterns.timestamp,
}

let resultChecks = (args: any) => ({
  userid: limits.patterns.uuid,
  login: new RegExp(`^${args.login}$`),
  name: new RegExp(`^${args.name}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: limits.patterns.uuid,
  timestamp: limits.patterns.timestamp,
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
  })
  let testcases = [{
    tag: 1,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "success",
    }],
  }, {
    tag: 2,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMax),
        password: "Aa!11111".repeat(3),
        name: "1".repeat(limits.users.nameLenMax),
      },
      expres: "success",
    }],
  }, {
    tag: 3,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin + 1),
        password: "Aa!111111",
        name: "1".repeat(limits.users.nameLenMin + 1),
      },
      expres: "success",
    }],
  }, {
    tag: 4,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin - 1),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "wrongValues.users.login",
    }],
  }, {
    tag: 5,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!1111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "wrongValues.users.password",
    }],
  }, {
    tag: 6,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin - 1),
      },
      expres: "wrongValues.users.name",
    }],
  }, {
    tag: 7,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "success",
    }, {
      args: {
        login: "2".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "success",
    }],
  }, {
    tag: 8,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "success",
    }, {
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "databaseConflicts.loginTaken",
    }],
  }, {
    tag: 9,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "success",
    }, {
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: "databaseConflicts.loginTaken",
    }, {
      args: {
        login: "2".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
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


