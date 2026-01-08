import * as users from "../../../lib/database/users"
import * as miscs from "../../../routes/miscs"
import { examples } from "../../../lib/test-data"

let profile = (userid: string) => ({
  userid: userid,
  region: examples.region.first,
  login: examples.login.correct[0],
  name: examples.name.correct[0],
  state: "inactive",
  puid: examples.uuid[1],
  timestamp: "123456789",
})

describe("testing auxilliary functions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: "Bearer " + examples.sessionid[0],
    mocks: {
      readUserid: {
        error: undefined,
        data: examples.uuid[0],
      },
      getProfile: {
        error: undefined,
        data: profile(examples.uuid[0]),
      },
    },
    mocksCalledWith: {
      readUserid: "Bearer " + examples.sessionid[0],
      getProfile: examples.uuid[0],
    },
    expres: {
      error: undefined,
      data: profile(examples.uuid[0]),
    },
  }, {
    tag: 2,
    args: "Bearer abcd",
    mocks: {
      readUserid: {
        error: "wrongValues.auth.sessionid",
        data: undefined,
      },
      getProfile: {
        error: undefined,
        data: profile(examples.uuid[0]),
      },
    },
    mocksCalledWith: {
      readUserid: "Bearer abcd",
    },
    expres: {
      error: "wrongValues.auth.sessionid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer " + examples.sessionid[1],
    mocks: {
      readUserid: {
        error: undefined,
        data: examples.uuid[1],
      },
      getProfile: {
        error: "databaseConflicts.profileNotFound",
        data: undefined,
      },
    },
    mocksCalledWith: {
      readUserid: "Bearer " + examples.sessionid[1],
      readProfile: examples.uuid[1],
    },
    expres: {
      error: "databaseConflicts.profileNotFound",
      data: undefined,
    },
  }]
   for ( let testcase of testcases ) {
    let { args, mocks, mocksCalledWith, expres, tag } = testcase
    test(`Function readProfile. Test #${tag}`, async () => {
      let readUserid = jest.spyOn(miscs, "readUserid").mockResolvedValue(mocks.readUserid)
      let getProfile = jest.spyOn(users, "getProfile").mockResolvedValue(mocks.getProfile)
      let result = await miscs.readProfile(args)
      expect(result).toStrictEqual(expres)
      if ( "readUserid" in mocksCalledWith ) {
        expect(readUserid).toHaveBeenCalledWith(mocksCalledWith.readUserid)
      }
      if ( "readProfile" in mocksCalledWith ) {
        expect(getProfile).toHaveBeenCalledWith(mocksCalledWith.readProfile)
      }
    })
  }
})

    
