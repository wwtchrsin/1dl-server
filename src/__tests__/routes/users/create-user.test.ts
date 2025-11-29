process.env.PG_SCHEMA = "createUserRouteTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"
import { wrongValues, databaseErrors, databaseConflicts } 
  from "../../../lib/error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

const testServer = supertest(httpServer)

describe("testing routes...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM sessions")
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
        status: 201,
      },
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
        status: 201,
      },
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
        status: 201,
      },
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
        status: 400,
      },
    }],
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
        status: 400,
      },
    }],
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
        status: 400,
      },
    }],
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
        status: 201,
      },
    }, {   
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Bb@22222",
        name: "2".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: databaseConflicts.loginTaken,
        status: 409,
      },
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
        status: 201,
      },
    }, {   
      args: {
        login: "2".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 9,
    calls: [{   
      args: {
        login: "1".repeat(limits.users.loginLenMin - 1),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: wrongValues.users.login,
        status: 400,
      },
    }, {   
      args: {
        login: "1".repeat(limits.users.loginLenMin),
        password: "Aa!11111",
        name: "1".repeat(limits.users.nameLenMin),
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, tag } = testcase
    test(`Request POST /user. Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await testServer.post("/api/v1/users").send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        expect(result.body.error).toStrictEqual(expres.error)
        if ( expres.error === undefined ) {
          expect(result.body.session).toMatch(limits.patterns.uuid)
          expect(result.body.user).toBeDefined()
          expect(result.body.user.userid).toMatch(limits.patterns.uuid)
          expect(result.body.user.login).toBe(args.login)
          expect(result.body.user.password).toBeUndefined()
          expect(result.body.user.name).toBe(args.name)
          expect(result.body.user.state).toBeDefined()
          expect(result.body.user.puid).toMatch(limits.patterns.uuid)
          expect(result.body.user.timestamp).toMatch(limits.patterns.timestamp)
        } else {
          expect(result.body.session).toBeUndefined()
          expect(result.body.user).toBeUndefined()
        }
      }
    })
  }
})



