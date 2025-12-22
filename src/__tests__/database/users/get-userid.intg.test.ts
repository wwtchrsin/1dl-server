import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { getUserid } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
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

let sessionid = (sessionIndex: number) => databaseSessions[sessionIndex].sessionid

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: sessionid(0),
    expres: {
      error: undefined,
      data: userid(0),
    },
  }, {
    tag: 2,
    args: sessionid(1),
    expres: {
      error: undefined,
      data: userid(1),
    },
  }, {
    tag: 3,
    args: examples.sessionid[0],
    expres: {
      error: "databaseConflicts.sessionNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "databaseConflicts.sessionNotFound",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getUserid. Intg Test ${tag}`, async () => {
      let result = await getUserid(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
