import { pool, schema } from "../../../lib/database/conn"
import { getProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseUsers } from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let userid = (userIndex: number) => databaseUsers[userIndex].userid

let profile = (userIndex: number) => {
  let user = databaseUsers[userIndex]
  return {
    userid: user.userid,
    region: user.region,
    login: user.login,
    name: user.name,
    state: user.state,
    puid: user.puid,
    timestamp: user.timestamp,
  }
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: userid(0),
    expres: {
      error: undefined,
      data: profile(0),
    },
  }, {
    tag: 2,
    args: userid(3),
    expres: {
      error: undefined,
      data: profile(3),
    },
  }, {
    tag: 3,
    args: examples.uuid[0],
    expres: {
      error: "databaseConflicts.profileNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "databaseErrors.getProfile",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getProfile. Intg Test #${tag}`, async () => {
      let result = await getProfile(args)
      expect(result).toStrictEqual(expres)
    })
  }
})




      
