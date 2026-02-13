import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { verifyCredentials } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { examples, populateDatabase, databaseUsers } 
  from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
  })
  let testcases = [{
    tag: 1,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
    },
    expres: {
      error: undefined,
      userid: databaseUsers[0].userid,
    },
  }, {
    tag: 2,
    args: {
      region: databaseUsers[2].region,
      login: databaseUsers[2].login,
      password: databaseUsers[2].password,
    },
    expres: {
      error: undefined,
      userid: databaseUsers[2].userid,
    },
  }, {
    tag: 3,
    args: {
      region: "a",
      login: databaseUsers[2].login,
      password: databaseUsers[2].password,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: databaseUsers[1].password,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      login: examples.login.minLen,
      password: examples.password.minLen,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: undefined,
      login: databaseUsers[0].login,
      password: databaseUsers[0].password,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: databaseUsers[0].region,
      login: undefined,
      password: databaseUsers[0].password,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }, {
    tag: 8,
    args: {
      region: databaseUsers[0].region,
      login: databaseUsers[0].login,
      password: undefined,
    },
    expres: {
      error: "databaseConflict.profileNotFound",
      userid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function verifyCredentials. Intg Test #${tag}`, async () => {
      let result = await verifyCredentials(args)   
      if ( expres.error === undefined ) {     
        expect(result.error).toBeUndefined()
        expect(result.userid).toBe(expres.userid)
      } else {
        expect(result.error).toBe(expres.error)
        expect(result.userid).toBeUndefined()
      }
    })
  }
})



      
