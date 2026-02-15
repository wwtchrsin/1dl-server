import { pool, schema } from "../../../lib/database/conn"
import { createSession } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseSessions } 
  from "../../../lib/test-data"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addSessions)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM sessions")
    await pool.query(populateDatabase.addSessions)
  })
  let testcases = [{
    tag: 1,
    args: {
      userid: databaseSessions[0].userid,
      deviceid: examples.sessionid[0],
    },
    expres: {
      error: undefined,
      deviceid: databaseSessions[0].deviceid,
    },
  }, {
    tag: 2,
    args: {
      userid: databaseSessions[2].userid,
      deviceid: examples.sessionid[2],
    },
    expres: {
      error: undefined,
      deviceid: databaseSessions[2].deviceid,
    },
  }, {
    tag: 3,
    args: {
      userid: "abcd",
      deviceid: examples.sessionid[2],
    },
    expres: {
      error: "databaseError.deleteSession",
      deviceid: undefined,
    },
  }, {
    tag: 4,
    args: {
      userid: databaseSessions[2].userid,
      deviceid: "abcd",
    },
    expres: {
      error: undefined,
      deviceid: databaseSessions[2].deviceid,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Intg Test #${tag}`, async () => {
      let result = await createSession(args.userid, args.deviceid)
      expect(result.error).toBe(expres.error)
      expect(result.deviceid).toBe(expres.deviceid)
      if ( expres.error === undefined ) {     
        expect(result.sessionid).toMatch(patterns.sessionid)
      } else {
        expect(result.sessionid).toBeUndefined()
      }
    })
  }
  test("Function createSession. Intg Test #8", async () => {
    let args1 = {
      userid: databaseSessions[0].userid,
      deviceid: examples.sessionid[0],
    }
    let args2 = {
      userid: databaseSessions[1].userid,
      deviceid: examples.sessionid[1],
    }
    let resultA = await createSession(args1.userid, args1.deviceid)
    let resultB = await createSession(args1.userid, args1.deviceid)
    let resultC = await createSession(args2.userid, args2.deviceid)
    expect(resultA.error).toBeUndefined()
    expect(resultA.sessionid).toMatch(patterns.sessionid)
    expect(resultA.deviceid).toBe(databaseSessions[0].deviceid)
    expect(resultB.error).toBeUndefined()
    expect(resultB.sessionid).toMatch(patterns.sessionid)
    expect(resultB.deviceid).toBe(args1.deviceid)
    expect(resultC.error).toBeUndefined()
    expect(resultC.sessionid).toMatch(patterns.sessionid)
    expect(resultC.deviceid).toBe(databaseSessions[1].deviceid)
    expect(resultA.sessionid).not.toBe(resultB.sessionid)
    expect(resultA.sessionid).not.toBe(resultC.sessionid)
    expect(resultB.sessionid).not.toBe(resultC.sessionid)
  })
})



      
