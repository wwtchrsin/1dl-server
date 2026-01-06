import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { examples } from "../../../lib/test-data"

let correctUserids = [
  examples.uuid[0],
  examples.uuid[1],
]

let wrongUserid = examples.uuid[2]

let userlist = new Map([[correctUserids[0], {
  userid: correctUserids[0],
  login: examples.login.correct[0],
  name: examples.name.correct[0],
  state: "inactive",
  puid: examples.uuid[1],
  timestamp: "123456789",
}], [correctUserids[1], {
  userid: correctUserids[1],
  login: examples.login.correct[1],
  name: examples.name.correct[1],
  state: "inactive",
  puid: examples.uuid[3],
  timestamp: "123456789",
}]])

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [userid] = queryParams
  let user = userlist.get(userid)
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
    args: correctUserids[0],
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "success",
  }, {
    tag: 2,
    args: correctUserids[1],
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
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: wrongUserid,
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: correctUserids[0],
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
        let user = userlist.get(args)
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toBe(args)
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

  
