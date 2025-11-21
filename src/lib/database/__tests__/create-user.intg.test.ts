process.env.PG_SCHEMA = "createUserTest"

import { pool, queryDatabase } from "../conn"
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
let passwordPattern = /^[0-9A-Fa-f]{128}$/
let timestampPattern = /^[1-9][0-9]{9,10}$/

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
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 2,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMax),
        password: "Aa!11111".repeat(3),
        name: "1".repeat(limits.users.nameLenMax),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMax) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMax) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMax) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMax) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 3,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin + 1),
        password: "Aa!111111",
        name: "1".repeat(limits.users.nameLenMin + 1),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMin + 1) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin + 1) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMin + 1) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin + 1) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 4,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin - 1),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: wrongValues.users.login,
        data: undefined,
      },
    }],
    table: [],
  }, {
    tag: 5,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!1111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: wrongValues.users.password,
        data: undefined,
      },
    }],
    table: [],
  }, {
    tag: 6,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin - 1),
      },
      expres: {
        error: wrongValues.users.name,
        data: undefined,
      },
    }],
    table: [],
  }, {
    tag: 7,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }, {
      args: {
        login: "2".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "2".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        }
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }, {
      userid: useridPattern,
      login: new RegExp("^" + "2".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 8,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        }
      },
    }, {
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: databaseConflicts.loginTaken,
        data: undefined,
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }, {
    tag: 9,
    calls: [{
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }, {
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: databaseConflicts.loginTaken,
        data: undefined,
      },
    }, {
      args: {
        login: "2".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        data: {
          userid: useridPattern,
          login: new RegExp("^" + "2".repeat(limits.users.loginLenMin) + "$"),
          name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
          state: new RegExp("^" + "inactive" + "$"),
          timestamp: timestampPattern,
        },
      },
    }],
    table: [{
      userid: useridPattern,
      login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }, {
      userid: useridPattern,
      login: new RegExp("^" + "2".repeat(limits.users.loginLenMin) + "$"),
      password: passwordPattern,
      name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
      state: new RegExp("^" + "inactive" + "$"),
      timestamp: timestampPattern,
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, table, tag } = testcase
    test(`Function createUser. Intg Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await createUser(args)
        if ( expres.error !== undefined ) {
          expect(result.error).toStrictEqual(expres.error)
          expect(result.data).toBeUndefined()
          continue
        }
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        for ( let key in expres.data ) {
          expect(`${result.data[key]}`).toMatch(expres.data[key])
        }
      }
      let result = await pool.query("SELECT * FROM users")
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


