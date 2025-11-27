import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"

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
        error: "databaseConflicts.sessionNotFound",
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
    expres: "wrongValues.users.userid",
  }, {
    tag: 4,
    args: uuid,
    mocks: {
      deleteSession: {
        error: "databaseErrors.deleteSession",
        data: undefined,
      },
      queryDatabase: {
        rows: [{}]
      },
    },
    expres: "databaseErrors.deleteSession",
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
    expres: "databaseErrors.createSession",
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
    expres: "databaseErrors.createSession",
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
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})
      
