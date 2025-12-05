import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { limits, examples } from "../../../lib/database/limits"

let correctData = {
  userid: examples.uuid[3],
  sessionid: examples.sessionid[3],
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: correctData.sessionid,
    mocks: {
      queryDatabase: {
        rows: [{ userid: correctData.userid }]
      },
    },
    expres: {
      error: undefined,
      data: correctData.userid,
    },
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: {
        rows: [{ userid: correctData.userid }]
      },
    },
    expres: {
      error: "authErrors.sessionid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: correctData.sessionid,
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
    args: correctData.sessionid,
    mocks: {
      queryDatabase: {
        rows: [{ 
          userid: correctData.userid
        }, {
          userid: correctData.userid
        }]
      },
    },
    expres: {
      error: "databaseErrors.deleteSession",
      data: undefined,
    },
  }, {
    tag: 5,
    args: correctData.sessionid,
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
    test(`Function deleteSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await users.deleteSession(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
