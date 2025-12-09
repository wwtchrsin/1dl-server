import * as users from "../../../lib/database/users"
import { readUserid } from "../../../routes/miscs"
import { examples } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      getUserid: {
        error: undefined,
        data: examples.uuid[0],
      },
    },
    mocksCalledWith: {
      getUserid: examples.sessionid[0],
    },
    expres: {
      error: undefined,
      data: examples.uuid[0],
    },
  }, {
    tag: 2,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      getUserid: {
        error: "databaseConflicts.sessionNotFound",
        data: undefined,
      },
    },
    mocksCalledWith: {
      getUserid: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflicts.sessionNotFound",
      data: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      getUserid: {
        error: "databaseConflicts.sessionNotFound",
        data: undefined,
      },
    },
    mocksCalledWith: {
      getUserid: examples.sessionid[0],
    },
    expres: {
      error: "databaseConflicts.sessionNotFound",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "",
    mocks: {
      getUserid: {
        error: undefined,
        data: examples.uuid[0],
      },
    },
    mocksCalledWith: {},
    expres: {
      error: "wrongValues.auth.header",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, mocksCalledWith, expres, tag } = testcase
    test(`Function readUserid. Test #${tag}`, async () => {
      let getUserid = jest.spyOn(users, "getUserid").mockResolvedValue(mocks.getUserid)
      let result = await readUserid(args)
      expect(result).toStrictEqual(expres)
      if ( "getUserid" in mocksCalledWith ) {
        expect(getUserid).toHaveBeenCalledWith(mocksCalledWith.getUserid)
      }
    })
  }
})

