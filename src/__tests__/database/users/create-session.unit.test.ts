import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import { hashPassword } from "../../../lib/database/miscs"

let correctData = {
  userid: examples.uuid[2],
  login: examples.login.correct[2],
  password: examples.password.correct[2],
}

let wrongData = {
  login: examples.login.correct[3],
  password: examples.password.correct[3],
}

let checkRequestSucceeds = (query: string, queryParams: string[]) => {
  let [login, passwordHash] = queryParams
  let correctPassword = hashPassword(correctData.login, correctData.password)
  if ( login === correctData.login && passwordHash === correctPassword ) {
    return Promise.resolve({ 
      rows: [{ userid: correctData.userid }]
    })
  }
  return Promise.resolve({ rows: [] })
}

let checkRequestFails = () => Promise.resolve(undefined)

let deleteRequestSucceeds = () => Promise.resolve({ rowCount: 1 })

let deleteRequestFails = () => Promise.resolve(undefined)

let mainRequestSucceeds = () => Promise.resolve({ rowCount: 1 })

let mainRequestFails = () => Promise.resolve(undefined)

let mockDatabaseQuery = ({ checkRequest, deleteRequest, mainRequest }: 
  { checkRequest: Function, deleteRequest: Function, mainRequest: Function }) => 
  ((query: string, queryParams: string[]) => {
    if ( query.trim().indexOf("SELECT") === 0 ) {
      return checkRequest(query, queryParams)
    }
    if ( query.trim().indexOf("DELETE") === 0 ) {
      return deleteRequest(query, queryParams)
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
        deleteRequest: deleteRequestSucceeds,
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
        deleteRequest: deleteRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 4,
    args: {
      login: "a",
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        deleteRequest: deleteRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 5,
    args: {
      login: correctData.login,
      password: "a",
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        deleteRequest: deleteRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseConflicts.profileNotFound",
  }, {
    tag: 6,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestFails,
        deleteRequest: deleteRequestSucceeds,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseErrors.checkCredentials",
  }, {
    tag: 8,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        deleteRequest: deleteRequestFails,
        mainRequest: mainRequestSucceeds,
      })
    },
    expres: "databaseErrors.deleteSession",
  }, {
    tag: 9,
    args: {
      login: correctData.login,
      password: correctData.password,
    },
    mocks: {
      queryDatabase: mockDatabaseQuery({
        checkRequest: checkRequestSucceeds,
        deleteRequest: deleteRequestSucceeds,
        mainRequest: mainRequestFails,
      })
    },
    expres: "databaseErrors.createSession",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createSession(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(patterns.sessionid)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})

    
