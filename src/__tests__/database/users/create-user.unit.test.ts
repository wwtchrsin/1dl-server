import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"

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
  userid: limits.patterns.uuid,
  login: new RegExp(`^${args.login}$`),
  name: new RegExp(`^${args.name}$`),
  state: new RegExp(`^[a-z]+$`),
  puid: limits.patterns.uuid,
  timestamp: limits.patterns.timestamp,
})

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      login: "1".repeat(limits.users.loginLenMax),
      password: "Aa!11111".repeat(3),
      name: "1".repeat(limits.users.nameLenMax),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      login: "1".repeat(limits.users.loginLenMin + 1),
      password: "Aa!111111",
      name: "1".repeat(limits.users.nameLenMin + 1),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "success",
  }, {
    tag: 4,
    args: {
      login: "1".repeat(limits.users.loginLenMin - 1),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.login",
  }, {
    tag: 5,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!1111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.password",
  }, {
    tag: 6,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMax + 1),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "wrongValues.users.name",
  }, {
    tag: 7,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginExists,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseConflicts.loginTaken",
  }, {
    tag: 8,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginCheckError,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseErrors.checkUserExists",
  }, {
    tag: 9,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsError,
    },
    expres: "databaseErrors.createUser",
  }, {
    tag: 10,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsZeroUsers,
    },
    expres: "databaseErrors.createUser",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createUser. Unit Test #${tag}`, async () => {
      let loginExists = jest.spyOn(users, "loginExists").mockImplementation(mocks.loginExists)
      let queryDatabase = jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createUser(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        let checks = resultChecks(args)
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

