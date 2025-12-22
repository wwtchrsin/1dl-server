import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseUsers } from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

describe("testing endpoints...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    actions: [{
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 1,
  }, {
    tag: 2,
    actions: [{
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 1,
  }, {
    tag: 3,
    actions: [{
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[1].password,
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    rowCount: 0,
  }, {
    tag: 4,
    actions: [{
      args: {
        login: databaseUsers[1].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    rowCount: 0,
  }, {
    tag: 5,
    actions: [{
      args: {
        login: examples.login.minLen + "abcd",
        password: examples.password.minLen + "abcd",
      },
      expres: {
        error: "databaseConflicts.profileNotFound",
        status: 404,
      },
    }],
    rowCount: 0,
  }, {
    tag: 6,
    actions: [{
      args: {
        password: databaseUsers[0].password,
      },
      expres: {
        error: "wrongValues.auth.login",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 7,
    actions: [{
      args: {
        login: {},
        password: databaseUsers[0].password,
      },
      expres: {
        error: "wrongValues.auth.login",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 8,
    actions: [{
      args: {
        login: databaseUsers[0].login,
      },
      expres: {
        error: "wrongValues.auth.password",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 9,
    actions: [{
      args: {
        login: databaseUsers[0].login,
        password: {},
      },
      expres: {
        error: "wrongValues.auth.password",
        status: 400,
      },
    }],
    rowCount: 0,
  }, {
    tag: 10,
    actions: [{
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 1,
  }, {
    tag: 11,
    actions: [{
      args: {
        login: databaseUsers[1].login,
        password: databaseUsers[1].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    rowCount: 2,
  }]
  for ( let testcase of testcases ) {
    let { actions, rowCount, tag } = testcase
    test(`POST /sessions. Test #${tag}`, async () => {
      for ( let action of actions ) {
        let { args, expres } = action
        let result = await testServer.post("/api/v1/sessions").send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.session).toMatch(patterns.sessionid)
        } else {
          let errorMessage = getErrorMessage(expres.error)
          expect(result.body.error).toStrictEqual(errorMessage)
          expect(result.body.session).toBeUndefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM sessions")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
    })
  }
})
      
      
      
    
      
    
