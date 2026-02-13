import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { examples } from "../../../lib/test-data"
import { hashPassword } from "../../../lib/database/miscs"

let correctData = {
  userid: examples.uuid[2],
  login: examples.login.correct[2],
  password: examples.password.correct[2],
  region: examples.region.first,
}

let wrongData = {
  login: examples.login.correct[3],
  password: examples.password.correct[3],
  region: examples.region.last,
}

let querySucceeds = (query: string, queryParams: string[]) => {
  let [region, login, passwordHash] = queryParams
  let correctPassword = hashPassword(correctData.login, correctData.password)
  if ( region === correctData.region &&
    login === correctData.login && 
    passwordHash === correctPassword ) {
      return Promise.resolve({ 
        rows: [{ userid: correctData.userid }]
      })
  }
  return Promise.resolve({ rows: [] })
}

let queryFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      region: correctData.region,
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: wrongData.region,
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "databaseConflict.profileNotFound",
  }, {
    tag: 3,
    args: {
      region: wrongData.region,
      login: wrongData.login,
      password: wrongData.password,
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "databaseConflict.profileNotFound",
  }, {
    tag: 4,
    args: {
      region: "a",
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "databaseConflict.profileNotFound",
  }, {
    tag: 5,
    args: {
      region: correctData.region,
      login: "a",
      password: correctData.password,
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "databaseConflict.profileNotFound",
  }, {
    tag: 6,
    args: {
      region: correctData.region,
      login: correctData.login,
      password: "a",
    },
    mocks: {
      queryDatabase: querySucceeds,
    },
    expres: "databaseConflict.profileNotFound",
  }, {
    tag: 7,
    args: {
      region: correctData.region,
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: queryFails,
    },
    expres: "databaseError.verifyCredentials",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.verifyCredentials(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.userid).toBe(correctData.userid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.userid).toBeUndefined()
      }
    })
  }
})

    
