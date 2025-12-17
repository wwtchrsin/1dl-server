process.env.PG_SCHEMA = "deleteSessionEndpointTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let rowCount = databaseSessions.length

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    args: "Bearer " + databaseSessions[0].sessionid,
    expres: {
      error: undefined,
      status: 200,
    },
  }, {
    tag: 2,
    args: "Bearer " + databaseSessions[1].sessionid,
    expres: {
      error: undefined,
      status: 200,
    },
  }, {
    tag: 3,
    args: "Bearer " + databaseSessions[0].sessionid,
    expres: {
      error: "databaseConflicts.sessionNotFound",
      status: 401,
    },
  }, {
    tag: 4,
    args: "Bearer " + examples.sessionid[0],
    expres: {
      error: "databaseConflicts.sessionNotFound",
      status: 401,
    },
  }, {
    tag: 5,
    args: "Bearer abcd",
    expres: {
      error: "wrongValues.auth.sessionid",
      status: 401,
    },
  }, {
    tag: 6,
    args: "",
    expres: {
      error: "wrongValues.auth.header",
      status: 401,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`DELETE /sessions. Test #${tag}`, async () => {
      let errorMessage = getErrorMessage(expres.error)
      let result = await testServer.delete("/api/v1/sessions")
        .set("Authorization", args)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      expect(result.body.error).toStrictEqual(errorMessage)
      rowCount -= (expres.error === undefined) ? 1 : 0
      let table = await queryDatabase("SELECT * FROM sessions")
      expect(table).toBeDefined()
      expect(table.rows).toHaveLength(rowCount)
    })
  }
})


