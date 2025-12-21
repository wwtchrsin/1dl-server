import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let correctData = {
  userid: examples.uuid[3],
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 1,
      },
    },
    expres: undefined,
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: {
        rowCount: 1,
      },
    },
    expres: undefined,
  }, {
    tag: 3,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 0,
      },
    },
    expres: "databaseConflicts.sessionNotFound",
  }, {
    tag: 4,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 2,
      },
    },
    expres: "databaseErrors.deleteSession",
  }, {
    tag: 5,
    args: correctData.userid,
    mocks: {
      queryDatabase: undefined,
    },
    expres: "databaseErrors.deleteSession",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function deleteSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await users.deleteSession(args)
      expect(result).toBe(expres)
    })
  }
})
