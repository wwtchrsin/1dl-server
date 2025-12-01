import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"

let userid = "53e291f8-522b-43b8-a5f5-84795b887a81"
let sessionid = "cf83e1357eefb8bdf1542850d66d8007d620e4050b5715dc83f4a921d36ce9ce47d0d13c5d85" +
  "f2b0ff8318d2877eec2f63b931bd47417a81a538327af927da3e"

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: sessionid,
    mocks: {
      queryDatabase: {
        rows: [{ userid }]
      },
    },
    expres: {
      error: undefined,
      data: userid,
    },
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: {
        rows: [{ userid }]
      },
    },
    expres: {
      error: "wrongValues.users.sessionid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: sessionid,
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
    args: sessionid,
    mocks: {
      queryDatabase: {
        rows: [{ userid }, { userid }]
      },
    },
    expres: {
      error: "databaseErrors.deleteSession",
      data: undefined,
    },
  }, {
    tag: 5,
    args: sessionid,
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
