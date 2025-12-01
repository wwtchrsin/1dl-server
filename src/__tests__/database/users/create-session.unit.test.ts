import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { hashPassword } from "../../../lib/database/miscs"

let correctData = {
  userid: "53e291f8-522b-43b8-a5f5-84795b887a81",
  login: "1".repeat(limits.users.loginLenMin),
  password: "Aa!11111",
  sessionid: "95d99ed3-a0a4-4751-847b-5f622b65fc1f",
}

let correctDataSessionUdf = {
  userid: "3e7e2b22-c7da-49a1-804f-61542c227d73",
  login: "2".repeat(limits.users.loginLenMin),
  password: "Bb@22222",
}

let wrongData = {
  login: "3".repeat(limits.users.loginLenMin),
  password: "Cc#33333",
}

let checkRequestSucceeds = (query: string, queryParams: string[]) => {
  let [login, passwordHash] = queryParams
  let correctPassword = hashPassword(correctData.login, correctData.password)
  if ( login === correctData.login && passwordHash === correctPassword ) {
    return Promise.resolve({ 
      rows: [{ 
        userid: correctData.userid,
        sessionid: correctData.sessionid,
      }]
    })
  }
  correctPassword = hashPassword(
    correctDataSessionUdf.login,
    correctDataSessionUdf.password)
  if ( login === correctDataSessionUdf.login && passwordHash === correctPassword ) {
    return Promise.resolve({
      rows: [{
        userid: correctData.userid,
        sessionid: null,
      }]
    })
  }
  return Promise.resolve({ rows: [] })
}

let checkRequestFails = () => Promise.resolve(undefined)

let mainRequestSucceeds = () => Promise.resolve({ rows: [{}] })

let mainRequestFails = () => Promise.resolve(undefined)

let mockDatabaseQuery = ({ checkRequest, mainRequest }: { checkRequest: Function, mainRequest: Function }) => 
  ((query: string, queryParams: string[]) => {
    if ( query.trim().indexOf("SELECT") === 0 ) {
      return checkRequest(query, queryParams)
    }
    if ( query.trim().indexOf("INSERT") === 0 ) {
      return mainRequest(query, queryParams)
    }
    return Promise.resolve(undefined)
  })

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      login: correctDataSessionUdf.login,
      password: correctDataSessionUdf.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      login: wrongData.login,
      password: wrongData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: {
      login: undefined,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "wrongValues.users.credentialsLogin",
  }, {
    tag: 5,
    args: {
      login: correctData.login,
      password: undefined,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "wrongValues.users.credentialsPassword",
  }, {
    tag: 6,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestFails,
      })
    },
    expres: "success",
  }, {
    tag: 7,
    args: {
      login: correctDataSessionUdf.login,
      password: correctDataSessionUdf.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        mainRequest: mainRequestFails,
      })
    },
    expres: "databaseErrors.createSession",
  }, {
    tag: 8,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestFails,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseErrors.checkCredentials",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createSession(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})

    
