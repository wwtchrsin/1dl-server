import { pool, schema } from "../../../lib/database/conn"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let databaseChecks = {
  userid: patterns.uuid,
  region: patterns.region,
  login: new RegExp(limits.user.login.pattern),
  password: patterns.passwordHash,
  name: new RegExp(`^.{${limits.user.name.minLen},${limits.user.name.maxLen}}$`),
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
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.minLen,
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }],
  }, {
    tag: 2,
    actions: [{
      args: {
        data: {
          region: examples.region.last,
          login: examples.login.maxLen,
          password: examples.password.maxLen,
          name: examples.name.maxLen,
        },
        state: "active"
      },
      expres: "success",
    }],
  }, {
    tag: 3,
    actions: [{
      args: {
        data: {
          region: examples.region.some,
          login: examples.login.regLen,
          password: examples.password.regLen,
          name: examples.name.regLen,
        },
        state: "active"
      },
      expres: "success",
    }],
  }, {
    tag: 4,
    actions: [{
      args: {
        data: {
          region: "abcd",
          login: examples.login.regLen,
          password: examples.password.regLen,
          name: examples.name.regLen,
        },
        state: "active"
      },
      expres: "success",
    }],
  }, {
    tag: 5,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.tooShort,
          password: examples.password.regLen,
          name: examples.name.regLen,
        },
        state: "active"
      },
      expres: "databaseError.createProfile",
    }],
  }, {
    tag: 6,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.regLen,
          password: examples.password.noDigits,
          name: examples.name.regLen,
        },
        state: "active",
      },
      expres: "success",
    }],
  }, {
    tag: 7,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.regLen,
          password: examples.password.regLen,
          name: examples.name.tooLong,
        },
        state: "active",
      },
      expres: "databaseError.createProfile",
    }],
  }, {
    tag: 8,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[0],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }, {
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[1],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }],
  }, {
    tag: 9,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[0],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }, {
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[0],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "databaseConflict.loginTaken",
    }],
  }, {
    tag: 10,
    actions: [{
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[2],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }, {
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[2],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "databaseConflict.loginTaken",
    }, {
      args: {
        data: {
          region: examples.region.first,
          login: examples.login.correct[3],
          password: examples.password.minLen,
          name: examples.name.minLen,
        },
        state: "active",
      },
      expres: "success",
    }],
  }]
  for ( let testcase of testcases ) {
    let { actions, tag } = testcase
    test(`Function createProfile. Intg Test #${tag}`, async () => {
      let msgCount = 0
      for ( let action of actions ) {
        let { args, expres } = action
        let result = await createProfile(args.data, args.state)
        if ( expres === "success" ) {
          expect(result.error).toBeUndefined()
          expect(result.data).toBeDefined()
          expect(result.data.userid).toMatch(patterns.uuid)
          expect(result.data.region).toBe(args.data.region)
          expect(result.data.login).toBe(args.data.login)
          expect(result.data.name).toBe(args.data.name)
          expect(result.data.color).toBeNull()
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
        expect(result.rows[i].region).toBeDefined()
        expect(result.rows[i].login).toMatch(databaseChecks.login)
        expect(result.rows[i].password).toMatch(databaseChecks.password)
        expect(result.rows[i].name).toMatch(databaseChecks.name)
        expect(result.rows[i].color).toBeNull()
        expect(result.rows[i].state).toMatch(databaseChecks.state)
        expect(result.rows[i].puid).toMatch(databaseChecks.puid)
        expect(result.rows[i].timestamp).toMatch(databaseChecks.timestamp)
      }
    })
  }
})


