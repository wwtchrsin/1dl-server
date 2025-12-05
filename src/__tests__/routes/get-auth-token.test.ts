import { getAuthToken } from "../../routes/miscs"
import { examples } from "../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: "Bearer " + examples.sessionid[0],
    expres: {
      error: undefined,
      data: examples.sessionid[0],
    },
  }, {
    tag: 2,
    args: examples.sessionid[0],
    expres: {
      error: "authErrors.header",
      data: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer ",
    expres: {
      error: "authErrors.header",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "Bearer abcd",
    expres: {
      error: undefined,
      data: "abcd",
    },
  }, {
    tag: 5,
    args: undefined,
    expres: {
      error: "authErrors.header",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getAuthToken. Test #${tag}`, () => {
      let result = getAuthToken(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
