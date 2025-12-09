import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits, patterns, examples } from "../../../lib/database/limits"

let loginDoesntExist = () => {
  return Promise.resolve({ error: undefined, data: false })
}

let loginExists = () => {
  return Promise.resolve({ error: undefined, data: true })
}

let loginCheckError = () => {
  return Promise.resolve({ error: "databaseErrors.checkUserExists", data: undefined })
}

let requestReturnsUser = (query: string, queryParams: string[]) => {
  let [userid, login, password, name, state, puid, timestamp] = queryParams
  let user = { userid, login, name, state, puid, timestamp: `${timestamp}` }
  return Promise.resolve({ rows: [user] })
}

let requestReturnsZeroUsers = () => {
  return Promise.resolve({ rows: [] })
}

let requestReturnsError = () => {
  return Promise.resolve(undefined)
}

let resultChecks = (args: any) => ({
  userid: patterns.uuid,
  login: new RegExp(`^${args.login}$`),
  name: new RegExp(`^${args.name}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: patterns.uuid,
  timestamp: patterns.timestamp,
})

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "success",
  }, {
    tag: 2,
    args: [{
      login: examples.login.maxLen,
      password: examples.password.maxLen,
      name: examples.name.maxLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser
    },
    expres: "success",
  }, {
    tag: 3,
    args: [{
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.regLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "success",
  }, {
    tag: 4,
    args: [{
      login: examples.login.tooShort,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.login",
  }, {
    tag: 5,
    args: [{
      login: examples.login.minLen,
      password: examples.password.tooShort,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.password",
  }, {
    tag: 6,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.tooLong,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.name",
  }, {
    tag: 7,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginExists,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseConflicts.loginTaken",
  }, {
    tag: 8,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginCheckError,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseErrors.checkUserExists",
  }, {
    tag: 9,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsError,
    },
    expres: "databaseErrors.createProfile",
  }, {
    tag: 10,
    args: [{
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    }, "active"],
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsZeroUsers,
    },
    expres: "databaseErrors.createProfile",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createProfile. Unit Test #${tag}`, async () => {
      let loginExists = jest.spyOn(users, "loginExists").mockImplementation(mocks.loginExists)
      let queryDatabase = jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createProfile(...args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        let checks = resultChecks(args[0])
        expect(result.data.userid).toMatch(checks.userid)
        expect(result.data.login).toMatch(checks.login)
        expect(result.data.name).toMatch(checks.name)
        expect(result.data.state).toMatch(checks.state)
        expect(result.data.puid).toMatch(checks.puid)
        expect(result.data.timestamp).toMatch(checks.timestamp)
        return
      }
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})

