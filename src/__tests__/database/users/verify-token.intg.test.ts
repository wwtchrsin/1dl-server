import { pool, schema } from "../../../lib/database/conn"
import { verifySessionToken } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseSessions } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let userid = (sessionIndex: number) => databaseSessions[sessionIndex].userid

let token = (sessionIndex: number) => databaseSessions[sessionIndex].token

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: token(0),
    expres: {
      error: undefined,
      userid: userid(0),
    },
  }, {
    tag: 2,
    args: token(1),
    expres: {
      error: undefined,
      userid: userid(1),
    },
  }, {
    tag: 3,
    args: examples.sessionid[0],
    expres: {
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function verifySessionToken. Intg Test ${tag}`, async () => {
      let result = await verifySessionToken(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
