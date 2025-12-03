process.env.PG_SCHEMA = "createProfileRouteTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"
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
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
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
        login: examples.login.maxLen,
        password: examples.password.maxLen,
        name: examples.name.maxLen,
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
        login: examples.login.regLen,
        password: examples.password.regLen,
        name: examples.name.regLen,
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
        login: examples.login.tooShort,
        password: examples.password.minLen,
        name: examples.name.minLen,
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
        login: examples.login.minLen,
        password: examples.password.tooLong,
        name: examples.name.minLen,
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
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.tooShort,
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
        login: examples.login.correct[0],
        password: examples.password.correct[0],
        name: examples.name.correct[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {   
      args: {
        login: examples.login.correct[0],
        password: examples.password.correct[1],
        name: examples.name.correct[1],
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
        login: examples.login.correct[0],
        password: examples.password.correct[0],
        name: examples.name.correct[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {   
      args: {
        login: examples.login.correct[1],
        password: examples.password.correct[1],
        name: examples.name.correct[1],
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
        login: examples.login.tooShort,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: {
        error: wrongValues.users.login,
        status: 400,
      },
    }, {   
      args: {
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, tag } = testcase
    test(`POST /profiles. Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let result = await testServer.post("/api/v1/profiles").send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        expect(result.body.error).toStrictEqual(expres.error)
        if ( expres.error === undefined ) {
          expect(result.body.session).toMatch(patterns.sessionid)
          expect(result.body.user).toBeDefined()
          expect(result.body.user.userid).toMatch(patterns.uuid)
          expect(result.body.user.login).toBe(args.login)
          expect(result.body.user.password).toBeUndefined()
          expect(result.body.user.name).toBe(args.name)
          expect(result.body.user.state).toBeDefined()
          expect(result.body.user.puid).toMatch(patterns.uuid)
          expect(result.body.user.timestamp).toMatch(patterns.timestamp)
        } else {
          expect(result.body.session).toBeUndefined()
          expect(result.body.user).toBeUndefined()
        }
      }
    })
  }
})



