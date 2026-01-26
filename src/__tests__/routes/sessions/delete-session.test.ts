import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"
import { getReports } from "../../../lib/redis/tests"

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
    args: "Bearer " + databaseSessions[0].sessionid,
    expres: {
      status: 200,
      error: undefined,
      userid: databaseSessions[0].userid,
    },
  }, {
    tag: 2,
    args: "Bearer " + databaseSessions[1].sessionid,
    expres: {
      status: 200,
      error: undefined,
      userid: databaseSessions[1].userid,
    },
  }, {
    tag: 3,
    args: "Bearer " + databaseSessions[0].sessionid,
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }, {
    tag: 4,
    args: "Bearer " + examples.sessionid[0],
    expres: {
      status: 401,
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }, {
    tag: 5,
    args: "Bearer abcd",
    expres: {
      status: 401,
      error: "wrongValue.auth.sessionid",
      userid: undefined,
    },
  }, {
    tag: 6,
    args: "",
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      userid: undefined,
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
      let reports = await reportsPromise
      expect(reports).toHaveLength(reportsCount)
      for ( let i=0; i < reports.length; i++ ) {
        expect(reports[i].userids).toBeDefined()
        expect(reports[i].userids).toHaveLength(1)
        expect(reports[i].userids[0]).toBe(expres.userid)
      }
    })
  }
})


