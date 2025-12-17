import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits, patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

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
      let [ userdata, state ] = args
      let result = await users.createProfile(userdata, state)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toMatch(patterns.uuid)
        expect(result.data.login).toBe(userdata.login)
        expect(result.data.name).toBe(userdata.name)
        expect(result.data.state).toBe(state)
        expect(result.data.puid).toMatch(patterns.uuid)
        expect(result.data.timestamp).toMatch(patterns.timestamp)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})

