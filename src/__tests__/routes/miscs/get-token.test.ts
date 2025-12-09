import { getToken } from "../../../routes/miscs"
import { examples } from "../../../lib/database/limits"

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
    args: "Bearer abcd",
    expres: {
      error: undefined,
      data: "abcd",
    },
  }, {
    tag: 3,
    args: "Bearer ",
    expres: {
      error: "wrongValues.auth.header",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "wrongValues.auth.header",
      data: undefined,
    },
  }, {
    tag: 5,
    args: "",
    expres: {
      error: "wrongValues.auth.header",
      data: undefined,
    },
  }, {
    tag: 6,
    args: undefined,
    expres: {
      error: "wrongValues.auth.header",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getToken. Test #${tag}`, async () => {
      let result = getToken(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

