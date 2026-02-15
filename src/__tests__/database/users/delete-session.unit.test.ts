import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { examples } from "../../../lib/test-data"

let correctData = {
  userid: examples.uuid[3],
  deviceid: examples.sessionid[3],
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 1,
        rows: [
          { deviceid: correctData.deviceid },
        ],
      },
    },
    expres: {
      error: undefined,
      deviceid: correctData.deviceid,
    }
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: {
        rowCount: 1,
        rows: [
          { deviceid: correctData.deviceid },
        ],
      },
    },
    expres: {
      error: undefined,
      deviceid: correctData.deviceid,
    },
  }, {
    tag: 3,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 0,
        rows: [],
      },
    },
    expres: {
      error: "databaseConflict.sessionNotFound",
      deviceid: undefined,
    },
  }, {
    tag: 4,
    args: correctData.userid,
    mocks: {
      queryDatabase: {
        rowCount: 2,
        rows: [
          { deviceid: correctData.deviceid },
          { deviceid: correctData.deviceid },
        ],
      },
    },
    expres: {
      error: "databaseError.deleteSession",
      deviceid: undefined,
    },
  }, {
    tag: 5,
    args: correctData.userid,
    mocks: {
      queryDatabase: undefined,
    },
    expres: {
      error: "databaseError.deleteSession",
      deviceid: undefined,
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
