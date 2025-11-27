import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let uuid = "53e291f8-522b-43b8-a5f5-84795b887a81"
let sessionid = "c656b2b6-5008-46d6-b407-92a050476048"

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: uuid,
    mocks: {
      queryDatabase: {
        rows: [{ sessionid }]
      },
    },
    expres: {
      error: undefined,
      data: sessionid
    },
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: {
        rows: [{ sessionid }]
      },
    },
    expres: {
      error: "wrongValues.users.userid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: uuid,
    mocks: {
      queryDatabase: {
        rows: []
      },
    },
    expres: {
      error: "databaseConflicts.sessionNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: uuid,
    mocks: {
      queryDatabase: {
        rows: [{ sessionid }, { sessionid }]
      },
    },
    expres: {
      error: "databaseErrors.deleteSession",
      data: undefined,
    },
  }, {
    tag: 5,
    args: uuid,
    mocks: {
      queryDatabase: undefined,
    },
    expres: {
      error: "databaseErrors.deleteSession",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await users.deleteSession(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
