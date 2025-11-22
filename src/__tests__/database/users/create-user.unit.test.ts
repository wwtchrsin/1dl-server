import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let uuidPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/
let timestampPattern = /^[1-9][0-9]{9,10}$/

let loginDoesntExist = () => {
  return Promise.resolve({ error: undefined, data: false })
}

let loginExists = () => {
  return Promise.resolve({ error: undefined, data: true })
}

let loginCheckError = () => {
  return Promise.resolve({ error: databaseErrors.checkUserExists, data: undefined })
}

let requestReturnsUser = (query: string, queryParams: string[]) => {
  let [userid, login, password, name, state, puid, timestamp] = queryParams
  let user = { userid, login, name, state, puid, timestamp }
  return Promise.resolve({ rows: [user] })
}

let requestReturnsZeroUsers = () => {
  return Promise.resolve({ rows: [] })
}

let requestReturnsError = () => {
  return Promise.resolve(undefined)
}

describe("testing database queries...", () => {
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
    expres: {
      error: undefined,
      data: {
        userid: uuidPattern,
        login: new RegExp("^" + "1".repeat(limits.users.loginLenMin) + "$"),
        name: new RegExp("^" + "1".repeat(limits.users.nameLenMin) + "$"),
        state: "inactive",
        puid: uuidPattern,
        timestamp: timestampPattern,
      },
    },
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
    expres: {
      error: undefined,
      data: {
        userid: uuidPattern,
        login: new RegExp("^" + "1".repeat(limits.users.loginLenMax) + "$"),
        name: new RegExp("^" + "1".repeat(limits.users.nameLenMax) + "$"),
        state: "inactive",
        puid: uuidPattern,
        timestamp: timestampPattern,
      },
    },
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
    expres: {
      error: undefined,
      data: {
        userid: uuidPattern,
        login: new RegExp("^" + "1".repeat(limits.users.loginLenMin + 1) + "$"),
        name: new RegExp("^" + "1".repeat(limits.users.nameLenMin + 1) + "$"),
        state: "inactive",
        puid: uuidPattern,
        timestamp: timestampPattern,
      },
    },
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
    expres: {
      error: wrongValues.users.login,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.users.password,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.users.name,
      data: undefined,
    },
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
    expres: {
      error: databaseConflicts.loginTaken,
      data: undefined,
    },
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
    expres: {
      error: databaseErrors.checkUserExists,
      data: undefined,
    },
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
    expres: {
      error: databaseErrors.createUser,
      data: undefined,
    },
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
    expres: {
      error: databaseErrors.createUser,
      data: undefined,
    },
  }]
  afterEach(() => {
    jest.restoreAllMocks()
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createUser. Unit Test #${tag}`, async () => {
      let loginExists = jest.spyOn(users, "loginExists").mockImplementation(mocks.loginExists)
      let queryDatabase = jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createUser(args)
      if ( expres.error !== undefined ) {
        expect(result.error).toStrictEqual(expres.error)
        expect(result.data).toBeUndefined()
        return
      }
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      for ( let key in expres.data ) {
        expect(`${result.data[key]}`).toMatch(expres.data[key])
      }
    })
  }
})

