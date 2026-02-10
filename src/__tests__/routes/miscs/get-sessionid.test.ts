import { getSessionid } from "../../../routes/miscs"
import { examples } from "../../../lib/test-data"
import env from "../../../lib/env"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: `Bearer ${env.serviceid}:${examples.sessionid[0]}`,
    expres: {
      error: undefined,
      data: examples.sessionid[0],
    },
  }, {
    tag: 2,
    args: `Bearer abcd:${examples.sessionid[0]}`,
    expres: {
      error: "wrongValue.auth.serviceid",
      data: undefined,
    },
  }, {
    tag: 3,
    args: "Bearer abcd:abcd",
    expres: {
      error: "wrongValue.auth.serviceid",
      data: undefined,
    },
  }, {
    tag: 4,
    args: `Bearer ${env.serviceid}:abcd`,
    expres: {
      error: undefined,
      data: "abcd",
    },
  }, {
    tag: 5,
    args: "Bearer abcd",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 6,
    args: "Bearer ",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 7,
    args: "abcd",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 8,
    args: "",
    expres: {
      error: "wrongValue.auth.header",
      data: undefined,
    },
  }, {
    tag: 9,
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

