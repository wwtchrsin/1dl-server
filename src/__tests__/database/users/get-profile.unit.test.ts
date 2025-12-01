import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { hashSession } from "../../../lib/database/miscs"

let sessionids = [
  "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85" +
    "f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
  "df83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85" +
    "f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
  "ef83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85" +
    "f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e",
]

let userlist = new Map([[hashSession(sessionids[0]), {
  userid: "b23a03a5-9f91-4422-a012-4b7d6183a83f",
  login: "1".repeat(limits.users.loginLenMin),
  name: "1".repeat(limits.users.nameLenMin),
  state: "inactive",
  puid: "46aa627b-9647-4b05-8084-90a658405fe4",
  timestamp: "123456789",
}], [hashSession(sessionids[1]), {
  userid: "91cfb27d-f9cf-441e-82e2-f645d2566b4e",
  login: "2".repeat(limits.users.loginLenMin),
  name: "2".repeat(limits.users.nameLenMin),
  state: "inactive",
  puid: "38945a9a-bdab-443b-9751-3419dbc72e6b",
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

  
