process.env.PG_SCHEMA = "createSessionRouteTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"
import { getErrorMessage } from "../../../lib/error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let correctData = [{
  login: examples.login.correct[0],
  password: examples.password.correct[0],
  name: examples.name.correct[0],
}, {
  login: examples.login.correct[1],
  password: examples.password.correct[1],
  name: examples.name.correct[1],
}]

let wrongData = {
  login: examples.login.correct[2],
  password: examples.password.correct[2],
}

describe("testing routes...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  test("POST /sessions. Preparing database...", async () => {
    for ( let user of correctData ) {
      let result = await testServer.post("/api/v1/profiles").send(user)
      expect(result.statusCode).toBe(201)
      expect(result.body).toBeDefined()
      expect(result.body.error).toBeUndefined()
      expect(result.body.user).toBeDefined()
      expect(result.body.session).toBeDefined()
    }
    let result = await queryDatabase("SELECT * FROM users")
    expect(result).toBeDefined()
    expect(result.rows).toHaveLength(correctData.length)
  })
  let testcases = [{
    tag: 1,
    calls: [{
      args: {
        login: correctData[0].login,
        password: correctData[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 1,
  }, {
    tag: 2,
    calls: [{
      args: {
        login: correctData[1].login,
        password: correctData[1].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 1,
  }, {
    tag: 3,
    calls: [{
      args: {
        login: correctData[0].login,
        password: correctData[1].password,
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    exprows: 0,
  }, {
    tag: 4,
    calls: [{
      args: {
        login: correctData[1].login,
        password: correctData[0].password,
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    exprows: 0,
  }, {
    tag: 5,
    calls: [{
      args: {
        login: wrongData.login,
        password: wrongData.password,
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    exprows: 0,
  }, {
    tag: 6,
    calls: [{
      args: {
        password: correctData[0].password,
      },
      expres: {
        error: "wrongValues.auth.login",
        status: 400,
      },
    }],
    exprows: 0,
  }, {
    tag: 7,
    calls: [{
      args: {
        login: {},
        password: correctData[0].password,
      },
      expres: {
        error: "wrongValues.auth.login",
        status: 400,
      },
    }],
    exprows: 0,
  }, {
    tag: 8,
    calls: [{
      args: {
        login: correctData[0].login,
      },
      expres: {
        error: "wrongValues.auth.password",
        status: 400,
      },
    }],
    exprows: 0,
  }, {
    tag: 9,
    calls: [{
      args: {
        login: correctData[0].login,
        password: {},
      },
      expres: {
        error: "wrongValues.auth.password",
        status: 400,
      },
    }],
    exprows: 0,
  }, {
    tag: 10,
    calls: [{
      args: {
        login: correctData[0].login,
        password: correctData[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      args: {
        login: correctData[0].login,
        password: correctData[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 1,
  }, {
    tag: 11,
    calls: [{
      args: {
        login: correctData[0].login,
        password: correctData[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      args: {
        login: correctData[1].login,
        password: correctData[1].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    exprows: 2,
  }]
  for ( let testcase of testcases ) {
    let { calls, exprows, tag } = testcase
    test(`POST /sessions. Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, expres } = call
        let errorMessage = getErrorMessage(expres.error)
        let result = await testServer.post("/api/v1/sessions").send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        expect(result.body.error).toStrictEqual(errorMessage)
        if ( expres.error === undefined ) {
          expect(result.body.session).toMatch(patterns.sessionid)
        }
      }
      let result = await queryDatabase("SELECT * FROM sessions")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(exprows)
    })
  }
})
      
      
      
    
      
    
