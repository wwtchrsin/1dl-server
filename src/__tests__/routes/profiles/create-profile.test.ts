import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import env from "../../../lib/env"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

const testServer = supertest(httpServer)

describe("testing endpoints...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM users")
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 2,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,    
      args: {
        region: examples.region.last,
        login: examples.login.maxLen,
        password: examples.password.maxLen,
        name: examples.name.maxLen,
        identifier: examples.sessionid[1],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 3,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,    
      args: {
        region: examples.region.some,
        login: examples.login.regLen,
        password: examples.password.regLen,
        name: examples.name.regLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 4,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,    
      args: {
        region: examples.region.first,
        login: examples.login.tooShort,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.user.login",
        status: 400,
      },
    }],
  }, {
    tag: 5,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.tooLong,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.user.password",
        status: 400,
      },
    }],
  }, {
    tag: 6,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.tooShort,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.user.name",
        status: 400,
      },
    }],
  }, {
    tag: 7,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: "abcd",
      },
      expres: {
        error: "wrongValue.user.identifier",
        status: 400,
      },
    }],
  }, {
    tag: 8,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.correct[0],
        password: examples.password.correct[0],
        name: examples.name.correct[0],
        identifier: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.correct[0],
        password: examples.password.correct[1],
        name: examples.name.correct[1],
        identifier: examples.sessionid[1],
      },
      expres: {
        error: "databaseConflict.loginTaken",
        status: 409,
      },
    }],
  }, {
    tag: 9,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,  
      args: {
        region: examples.region.first,
        login: examples.login.correct[0],
        password: examples.password.correct[0],
        name: examples.name.correct[0],
        identifier: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: examples.region.first,
        login: examples.login.correct[1],
        password: examples.password.correct[1],
        name: examples.name.correct[1],
        identifier: examples.sessionid[1],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 10,
    calls: [{
      auth: `Bearer ${env.serviceid}:`,   
      args: {
        region: "abcd",
        login: examples.login.tooShort,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.user.region",
        status: 400,
      },
    }, {   
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
  }, {
    tag: 11,
    calls: [{
      auth: `Bearer abcd:`,
      args: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
        identifier: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.auth.serviceid",
        status: 401,
      },
    }],
  }]
  for ( let testcase of testcases ) {
    let { calls, tag } = testcase
    test(`POST /profiles. Test #${tag}`, async () => {
      for ( let call of calls ) {
        let { args, auth, expres } = call
        let result = await testServer.post("/api/v1/profiles")
          .set("Authorization", auth).send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        expect(result.body.error).toBe(expres.error)
        if ( expres.error === undefined ) {
          expect(result.body.sessionid).toMatch(patterns.sessionid)
          expect(result.body.profile).toBeDefined()
          expect(result.body.profile.userid).toBeUndefined()
          expect(result.body.profile.login).toBe(args.login)
          expect(result.body.profile.password).toBeUndefined()
          expect(result.body.profile.name).toBe(args.name)
          expect(result.body.profile.state).toBeDefined()
          expect(result.body.profile.puid).toMatch(patterns.uuid)
          expect(result.body.profile.timestamp).toMatch(patterns.timestamp)
        } else {
          expect(result.body.sessionid).toBeUndefined()
          expect(result.body.profile).toBeUndefined()
        }
      }
    })
  }
})



