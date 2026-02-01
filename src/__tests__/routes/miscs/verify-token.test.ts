import * as users from "../../../lib/database/users"
import { verifyToken } from "../../../routes/miscs"
import { examples } from "../../../lib/test-data"

describe("testing auxilliary functions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      verify: {
        error: undefined,
        userid: examples.uuid[0],
      },
    },
    mocksCalledWith: {
      verify: examples.sessionid[0],
    },
    expres: {
      error: undefined,
      userid: examples.uuid[0],
    },
  }, {
    tag: 2,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      verify: {
        error: "databaseConflict.sessionNotFound",
        userid: undefined,
      },
    },
    mocksCalledWith: {
      verify: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      verify: {
        error: "databaseConflict.sessionNotFound",
        userid: undefined,
      },
    },
    mocksCalledWith: {
      verify: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflict.sessionNotFound",
      userid: undefined,
    },
  }, {
    tag: 4,
    args: "",
    mocks: {
      verify: {
        error: undefined,
        userid: examples.uuid[0],
      },
    },
    mocksCalledWith: {},
    expres: {
      error: "wrongValue.auth.header",
      userid: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, mocksCalledWith, expres, tag } = testcase
    test(`Function readUserid. Test #${tag}`, async () => {
      let verify = jest.spyOn(users, "verifySessionToken")
        .mockResolvedValue(mocks.verify)
      let result = await verifyToken(args)
      expect(result).toStrictEqual(expres)
      if ( "verify" in mocksCalledWith ) {
        expect(verify).toHaveBeenCalledWith(mocksCalledWith.verify)
      }
    })
  }
})

