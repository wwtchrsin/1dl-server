import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"

let sessionids = [
  "53e291f8-522b-43b8-a5f5-84795b887a81",
  "c656b2b6-5008-46d6-b407-92a050476048",
  "a8cfe631-a354-4f66-b29b-8b76e5964974",
]

let userlist = new Map([[sessionids[0], {
  userid: "b23a03a5-9f91-4422-a012-4b7d6183a83f",
  login: "1".repeat(limits.users.loginLenMin),
  name: "1".repeat(limits.users.nameLenMin),
  state: "inactive",
  puid: "46aa627b-9647-4b05-8084-90a658405fe4",
  timestamp: "123456789",
}], [sessionids[1], {
  userid: "91cfb27d-f9cf-441e-82e2-f645d2566b4e",
  login: "2".repeat(limits.users.loginLenMin),
  name: "2".repeat(limits.users.nameLenMin),
  state: "inactive",
  puid: "38945a9a-bdab-443b-9751-3419dbc72e6b",
  timestamp: "123456789",
}]])

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [sessionid] = queryParams
  let user = userlist.get(sessionid)
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
    args: sessionids[0],
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "success",
  }, {
    tag: 2,
    args: sessionids[1],
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
    expres: "wrongValues.users.sessionid",
  }, {
    tag: 4,
    args: sessionids[2],
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: sessionids[0],
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

  
