import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { examples } from "../../../lib/test-data"

let token = examples.sessionid[0]
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
    args: token,
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
    expres: "success",
  }, {
    tag: 3,
    args: token,
    mocks: {
      queryDatabase: sessionNotFound,
    },
    expres: "databaseConflict.sessionNotFound",
  }, {
    tag: 4,
    args: token,
    mocks: {
      queryDatabase: requestFails,
    },
    expres: "databaseError.verifySessionToken",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function verifySessionToken. Unit Test ${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.verifySessionToken(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.userid).toBe(userid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.userid).toBeUndefined()
      }
    })
  }
})