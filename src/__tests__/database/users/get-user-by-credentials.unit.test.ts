import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { hashPassword } from "../../../lib/database/miscs"
import { databaseConflicts, databaseErrors } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let correctPassword = "Aa!11111"

let correctData = {
  userid: "53e291f8-522b-43b8-a5f5-84795b887a81",
  login: "1".repeat(limits.users.loginLenMin),
  name: "1".repeat(limits.users.nameLenMin),
  state: "inactive",
  puid: "53e291f8-522b-43b8-a5f5-84795b887a81",
  timestamp: "123456789",
}

let wrongPassword = "BB!22222"
let wrongLogin = "2".repeat(limits.users.loginLenMin)

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [login, passwordHash] = queryParams
  let correctPasswordHash = hashPassword(correctData.login, correctPassword)
  if ( correctData.login === login && passwordHash === correctPasswordHash ) {
    return Promise.resolve({ rows: [correctData] })
    }
  return Promise.resolve({ rows: [] })
}

let requestFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      login: correctData.login,
      password: correctPassword,
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: undefined,
      data: correctData,
    },
  }, {
    tag: 2,
    args: {
      login: wrongLogin,
      password: wrongPassword,
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "databaseConflicts.userNotFound",
      data: undefined,
    },
  }, {
    tag: 3,
    args: {
      login: correctData.login,
      password: wrongPassword,
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "databaseConflicts.userNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      login: wrongLogin,
      password: correctPassword,
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "databaseConflicts.userNotFound",
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      login: "1",
      password: "1",
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "databaseConflicts.userNotFound",
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      password: "Aa!11111",
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "wrongValues.users.credentialsLogin",
      data: undefined,
    },
  }, {
    tag: 7,
    args: {
      login: {},
      password: "Aa!11111",
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "wrongValues.users.credentialsLogin",
      data: undefined,
    },
  }, {
    tag: 8,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "wrongValues.users.credentialsPassword",
      data: undefined,
    },
  }, {
    tag: 9,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: {},
    },
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: "wrongValues.users.credentialsPassword",
      data: undefined,
    },
  }, {
    tag: 10,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
    },
    mocks: {
      queryDatabase: requestFails,
    },
    expres: {
      error: "databaseErrors.getUserByCredentials",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getUserByCredentials. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.getUserByCredentials(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

    
