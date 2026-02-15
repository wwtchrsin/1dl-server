import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"
import { getReports } from "../../../lib/redis/tests"
import env from "../../../lib/env"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let rowCount = databaseSessions.length

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    args: `Bearer ${env.serviceid}:${databaseSessions[0].sessionid}`,
    expres: {
      status: 200,
      error: undefined,
      deviceid: databaseSessions[0].deviceid,
    },
  }, {
    tag: 2,
    args: `Bearer ${env.serviceid}:${databaseSessions[1].sessionid}`,
    expres: {
      status: 200,
      error: undefined,
      deviceid: databaseSessions[1].deviceid,
    },
  }, {
    tag: 3,
    args: `Bearer ${env.serviceid}:${databaseSessions[0].sessionid}`,
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      deviceid: undefined,
    },
  }, {
    tag: 4,
    args: `Bearer ${env.serviceid}:${examples.sessionid[0]}`,
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      deviceid: undefined,
    },
  }, {
    tag: 5,
    args: `Bearer ${env.serviceid}:abcd`,
    expres: {
      status: 401,
      error: "wrongValue.auth.sessionid",
      deviceid: undefined,
    },
  }, {
    tag: 6,
    args: `Bearer abcd:${examples.sessionid[0]}`,
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      deviceid: undefined,
    },
  }, {
    tag: 7,
    args: "",
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      deviceid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`DELETE /sessions. Test #${tag}`, async () => {
      let reportsCount = expres.error ? 0 : 1
      let reportsPromise = getReports("sessions:deleted", reportsCount)
      let result = await testServer.delete("/api/v1/sessions")
        .set("Authorization", args)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      expect(result.body.error).toBe(expres.error)
      rowCount -= (expres.error === undefined) ? 1 : 0
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
      let reportsResult = await reportsPromise
      expect(reportsResult).toHaveLength(reportsCount)
      for ( let i=0; i < reportsResult.length; i++ ) {
        expect(reportsResult[i].deviceids).toBeDefined()
        expect(reportsResult[i].deviceids).toHaveLength(1)
        expect(reportsResult[i].deviceids[0]).toBe(expres.deviceid)
      }
    })
  }
})


