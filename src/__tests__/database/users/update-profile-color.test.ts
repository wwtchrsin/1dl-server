import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { updateProfileColor } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseUsers } from "../../../lib/test-data"

beforeAll(async () => {
  if ( schema === "public" ) {
    throw new Error("public schema selected for the test!")
  }
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let userid = (userIndex: number) => databaseUsers[userIndex].userid

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      userid: userid(0),
      color: limits.message.color.values[0],
    },
    expres: {
      error: undefined,
    },
  }, {
    tag: 2,
    args: {
      userid: userid(3),
      color: limits.message.color.values[limits.message.color.values.length - 1]
    },
    expres: {
      error: undefined,
    },
  }, {
    tag: 3,
    args: {
      userid: examples.uuid[0],
      color: limits.message.color.values[0],
    },
    expres: {
      error: "databaseConflict.profileNotFound",
    },
  }, {
    tag: 4,
    args: {
      userid: "abcd",
      color: limits.message.color.values[0],
    },
    expres: {
      error: "databaseError.updateProfileColor",
    },
  }, {
    tag: 5,
    args: {
      userid: userid(0),
      color: "abcd",
    },
    expres: {
      error: "databaseError.updateProfileColor",
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function updateProfileColor. Test #${tag}`, async () => {
      let result = await updateProfileColor(args.userid, args.color)
      expect(result).toStrictEqual(expres)
      if ( result.error === undefined ) {
        let query = `SELECT color FROM users WHERE userid = $1`
        let profile = await queryDatabase(query, [args.userid])
        expect(profile).toBeDefined()
        expect(profile.rows).toHaveLength(1)
        expect(profile.rows[0].color).toBe(args.color)
      }
    })
  }
})




      
