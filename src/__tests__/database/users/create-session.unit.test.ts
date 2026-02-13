import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let correctData = {
  userid: examples.uuid[2],
  identifier: examples.sessionid[2],
}

let queryDatabase = (query: string, queryParams: string[]) => {
  if ( query.trim().indexOf("DELETE") === 0 ) {
    if ( queryParams[0] !== correctData.userid ) {
      return Promise.resolve(undefined)
    }
    return Promise.resolve({ rowCount: 1 })
  }
  if ( query.trim().indexOf("INSERT") === 0 ) {
    if ( queryParams[0] !== correctData.userid ) {
      return Promise.resolve(undefined)
    }
  }
  return Promise.resolve({ rowCount: 1 })
}

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      userid: correctData.userid,
      identifier: correctData.identifier,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      userid: "abcd",
      identifier: correctData.identifier,
    },
    expres: "databaseError.deleteSession",
  }, {
    tag: 3,
    args: {
      userid: correctData.userid,
      identifier: "abcd",
    },
    expres: "success",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(queryDatabase)
      let result = await users.createSession(args.userid, args.identifier)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.sessionid).toMatch(patterns.sessionid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.sessionid).toBeUndefined()
      }
    })
  }
})

    
