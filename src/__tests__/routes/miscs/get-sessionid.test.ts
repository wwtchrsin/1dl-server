import { getSessionid } from "../../../routes/miscs"
import { examples } from "../../../lib/test-data"

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
      error: "wrongValue.auth.sessionid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer ",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 4,
    args: "abcd",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 5,
    args: "",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 6,
    args: undefined,
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getSessionid. Test #${tag}`, async () => {
      let result = getSessionid(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

