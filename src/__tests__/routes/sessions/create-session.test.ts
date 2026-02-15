import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { getReports } from "../../../lib/redis/tests"
import { examples, populateDatabase, databaseUsers, activeUsersByRegion } 
  from "../../../lib/test-data"
import env from "../../../lib/env"

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
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [examples.sessionid[0]],
    },
    rowCount: 1,
  }, {
    tag: 2,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[2].region,
        login: databaseUsers[2].login,
        password: databaseUsers[2].password,
        deviceid: examples.sessionid[2],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [examples.sessionid[2]],
    },
    rowCount: 1,
  }, {
    tag: 3,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[1].region,
        login: databaseUsers[1].login,
        password: databaseUsers[1].password,
        deviceid: examples.sessionid[0],
        profile: true,
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 1,
  }, {
    tag: 4,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: limits.message.region.values[1],
        login: databaseUsers[activeUsersByRegion[0][0]].login,
        password: databaseUsers[activeUsersByRegion[0][0]].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "databaseConflict.profileNotFound",
        status: 404,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 5,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[1].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "databaseConflict.profileNotFound",
        status: 404,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 6,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[1].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "databaseConflict.profileNotFound",
        status: 404,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 7,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: examples.region.first + "abcd",
        login: examples.login.minLen + "abcd",
        password: examples.password.minLen + "abcd",
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "databaseConflict.profileNotFound",
        status: 404,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 8,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0]
      },
      expres: {
        error: "wrongValue.auth.region",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 9,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: {},
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0]
      },
      expres: {
        error: "wrongValue.auth.region",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 10,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0]
      },
      expres: {
        error: "wrongValue.auth.login",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 11,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: {},
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0]
      },
      expres: {
        error: "wrongValue.auth.login",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 12,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        deviceid: examples.sessionid[0]
      },
      expres: {
        error: "wrongValue.auth.password",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 13,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: {},
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.auth.password",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 14,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
      },
      expres: {
        error: "wrongValue.user.deviceid",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 15,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: {},
      },
      expres: {
        error: "wrongValue.user.deviceid",
        status: 400,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }, {
    tag: 16,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[1],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    reports: {
      "sessions:deleted": [examples.sessionid[0]],
      "sessions:created": [
        examples.sessionid[0],
        examples.sessionid[1],
      ],
    },
    rowCount: 1,
  }, {
    tag: 17,
    actions: [{
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[1].region,
        login: databaseUsers[1].login,
        password: databaseUsers[1].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }, {
      auth: `Bearer ${env.serviceid}:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[1],
      },
      expres: {
        error: undefined,
        status: 201,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [
        examples.sessionid[0],
        examples.sessionid[1],
      ],
    },
    rowCount: 2,
  }, {
    tag: 18,
    actions: [{
      auth: `Bearer abcd:`,
      args: {
        region: databaseUsers[0].region,
        login: databaseUsers[0].login,
        password: databaseUsers[0].password,
        deviceid: examples.sessionid[0],
      },
      expres: {
        error: "wrongValue.auth.serviceid",
        status: 401,
      },
    }],
    reports: {
      "sessions:deleted": [],
      "sessions:created": [],
    },
    rowCount: 0,
  }]
  for ( let testcase of testcases ) {
    let { actions, rowCount, reports, tag } = testcase
    test(`POST /sessions. Test #${tag}`, async () => {
      let cReportsPromise = getReports("sessions:created",
        reports["sessions:created"].length)
      let dReportsPromise = getReports("sessions:deleted", 
        reports["sessions:deleted"].length)
      for ( let action of actions ) {
        let { args, auth, expres } = action
        let result = await testServer.post("/api/v1/sessions")
          .set("Authorization", auth).send(args)
        expect(result.statusCode).toBe(expres.status)
        expect(result.body).toBeDefined()
        if ( expres.error === undefined ) {
          expect(result.body.error).toBeUndefined()
          expect(result.body.sessionid).toMatch(patterns.sessionid)
        } else {
          expect(result.body.error).toBe(expres.error)
          expect(result.body.sessionid).toBeUndefined()
          expect(result.body.profile).toBeUndefined()
        }
        if ( expres.error === undefined && (args as any).profile === true ) {
          expect(result.body.profile).toBeDefined()
          expect(result.body.profile.userid).toBeUndefined()
          expect(result.body.profile.login).toBe((args as any).login)
          expect(result.body.profile.password).toBeUndefined()
          expect(result.body.profile.name).toBeDefined()
          expect(result.body.profile.state).toBeDefined()
          expect(result.body.profile.puid).toMatch(patterns.uuid)
          expect(result.body.profile.timestamp).toBeDefined()
        }
      }
      let result = await queryDatabase("SELECT * FROM sessions")
      expect(result).toBeDefined()
      expect(result.rows).toHaveLength(rowCount)
      let cReportsResult = await cReportsPromise
      expect(cReportsResult).toHaveLength(reports["sessions:created"].length)
      for ( let i=0; i < cReportsResult.length; i++ ) {
        expect(cReportsResult[i].deviceids).toBeDefined()
        expect(cReportsResult[i].deviceids).toHaveLength(1)
        expect(cReportsResult[i].deviceids[0]).toBe(reports["sessions:created"][i])
      }
      let dReportsResult = await dReportsPromise
      expect(dReportsResult).toHaveLength(reports["sessions:deleted"].length)
      for ( let i=0; i < dReportsResult.length; i++ ) {
        expect(dReportsResult[i].deviceids).toBeDefined()
        expect(dReportsResult[i].deviceids).toHaveLength(1)
        expect(dReportsResult[i].deviceids[0]).toBe(reports["sessions:deleted"][i])
      }
    })
  }
})
      
      
      
    
      
    
