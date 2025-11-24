import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let uuid = "53e291f8-522b-43b8-a5f5-84795b887a81"

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: uuid,
    mocks: {
      deleteSession: {
        error: undefined,
        data: uuid,
      },
      queryDatabase: {
        rows: [{}]
      },
    },
    expres: "success",
  }, {
    tag: 2,
    args: uuid,
    mocks: {
      deleteSession: {
        error: databaseConflicts.sessionNotFound,
        data: undefined,
      },
      queryDatabase: {
        rows: [{}]
      },
    },
    expres: "success",
  }, {
    tag: 3,
    args: "abcd",
    mocks: {
      deleteSession: {
        error: undefined,
        data: uuid,
      },
      queryDatabase: {
        rows: [{}]
      },
    },
    expres: {
      error: wrongValues.users.userid,
      data: undefined,
    },
  }, {
    tag: 4,
    args: uuid,
    mocks: {
      deleteSession: {
        error: databaseErrors.deleteSession,
        data: undefined,
      },
      queryDatabase: {
        rows: [{}]
      },
    },
    expres: {
      error: databaseErrors.deleteSession,
      data: undefined,
    },
  }, {
    tag: 5,
    args: uuid,
    mocks: {
      deleteSession: {
        error: undefined,
        data: uuid,
      },
      queryDatabase: undefined,
    },
    expres: {
      error: databaseErrors.createSession,
      data: undefined,
    },
  }, {
    tag: 6,
    args: uuid,
    mocks: {
      deleteSession: {
        error: undefined,
        data: uuid,
      },
      queryDatabase: { 
        rows: []
      },
    },
    expres: {
      error: databaseErrors.createSession,
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, mocks, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(users, "deleteSession").mockResolvedValue(mocks.deleteSession)
      jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await users.createSession(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toMatch(limits.patterns.uuid)
        return
      }
      expect(result).toStrictEqual(expres)
    })
  }
})
      
