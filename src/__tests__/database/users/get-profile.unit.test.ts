import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits, examples } from "../../../lib/database/limits"
import { hashSession } from "../../../lib/database/miscs"

let correctSessionids = [
  examples.sessionid[0],
  examples.sessionid[1],
]

let wrongSessionid = examples.sessionid[2]

let userlist = new Map([[hashSession(correctSessionids[0]), {
  userid: examples.uuid[0],
  login: examples.login.correct[0],
  name: examples.name.correct[0],
  state: "inactive",
  puid: examples.uuid[1],
  timestamp: "123456789",
}], [hashSession(correctSessionids[1]), {
  userid: examples.uuid[2],
  login: examples.login.correct[1],
  name: examples.name.correct[1],
  state: "inactive",
  puid: examples.uuid[3],
  timestamp: "123456789",
}]])

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [sessionHash] = queryParams
  let user = userlist.get(sessionHash)
  let rows = user !== undefined ? [user] : []
  return Promise.resolve({ rows })
}

let requestFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: correctSessionids[0],
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "success",
  }, {
    tag: 2,
    args: correctSessionids[1],
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "success",
  }, {
    tag: 3,
    args: "abcd",
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "authErrors.sessionid",
  }, {
    tag: 4,
    args: wrongSessionid,
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: correctSessionids[0],
    mocks: {
      queryDatabase: requestFails,
    },
    expres: "databaseErrors.getProfile",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getProfile. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.getProfile(args)
      if ( expres === "success" ) {
        let user = userlist.get(hashSession(args))
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toBe(user.userid)
        expect(result.data.login).toBe(user.login)
        expect(result.data.name).toBe(user.name)
        expect(result.data.state).toBe(user.state)
        expect(result.data.puid).toBe(user.puid)
        expect(result.data.timestamp).toBe(user.timestamp)
        return
      }
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})

  
