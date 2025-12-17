import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits, patterns, examples } from "../../../lib/database/limits"
import { hashPassword } from "../../../lib/database/miscs"
import { examples } from "../../../lib/test-data"

let sessionid = examples.sessionid[0]
let userid = examples.uuid[0]

let sessionFound = () => Promise.resolve({ rows: [{ userid }] })

let sessionNotFound = () => Promise.resolve({ rows: [] })

let requestFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: sessionid,
    mocks: {
      queryDatabase: sessionFound,
    },
    expres: "success",
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: sessionFound,
    },
    expres: "wrongValues.auth.sessionid",
  }, {
    tag: 3,
    args: sessionid,
    mocks: {
      queryDatabase: sessionNotFound,
    },
    expres: "databaseConflicts.sessionNotFound",
  }, {
    tag: 4,
    args: sessionid,
    mocks: {
      queryDatabase: requestFails,
    },
    expres: "databaseErrors.getUserid",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getUserid. Unit Test ${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.getUserid(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBe(userid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})
    
