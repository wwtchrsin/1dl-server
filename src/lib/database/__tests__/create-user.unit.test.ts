import * as users from "../users"
import * as conn from "../conn"
import limits from "../limits"
import { databaseErrors, databaseConflicts } from "../../error-messages"
import { wrongValues } from "../../error-messages"

let message = {
  userid: "1",
  login: "1",
  password: "1",
  name: "1",
  state: "1",
  timestamp: "1",
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
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] }
    },
    expres: {
      error: undefined
    },
  }, {
    tag: 2,
    args: {
      login: "1".repeat(limits.users.loginLenMax),
      password: "Aa!11111".repeat(3),
      name: "1".repeat(limits.users.nameLenMax),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] }
    },
    expres: {
      error: undefined
    },
  }, {
    tag: 3,
    args: {
      login: "1".repeat(limits.users.loginLenMin + 1),
      password: "Aa!111111",
      name: "1".repeat(limits.users.nameLenMin + 1),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: undefined
    },
  }, {
    tag: 4,
    args: {
      login: "1".repeat(limits.users.loginLenMin - 1),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: wrongValues.users.login
    },
  }, {
    tag: 5,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!1111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: wrongValues.users.password
    },
  }, {
    tag: 6,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMax + 1),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: wrongValues.users.name
    },
  }, {
    tag: 7,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: undefined, data: true },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: databaseConflicts.loginTaken
    },
  }, {
    tag: 8,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: databaseErrors.checkUserExists, data: undefined },
      queryDatabase: { rows: [message] },
    },
    expres: {
      error: databaseErrors.checkUserExists
    },
  }, {
    tag: 9,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: undefined,
    },
    expres: {
      error: databaseErrors.createUser
    },
  }, {
    tag: 10,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    },
    mocks: {
      loginExists: { error: undefined, data: false },
      queryDatabase: { rows: [] },
    },
    expres: {
      error: databaseErrors.createUser
    },
  }]
  afterEach(() => {
    jest.restoreAllMocks()
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createUser. Unit Test #${tag}`, async () => {
      let loginExists = jest.spyOn(users, "loginExists").mockResolvedValue(mocks.loginExists)
      let queryDatabase = jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await users.createUser(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

