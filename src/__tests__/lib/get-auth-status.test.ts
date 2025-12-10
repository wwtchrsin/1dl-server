import { getAuthStatus } from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: 400,
    expres: 401,
  }, {
    tag: 2,
    args: 401,
    expres: 401,
  }, {
    tag: 3,
    args: 402,
    expres: 402,
  }, {
    tag: 4,
    args: 404,
    expres: 401,
  }, {
    tag: 5,
    args: 409,
    expres: 401,
  }, {
    tag: 6,
    args: 418,
    expres: 418,
  }, {
    tag: 7,
    args: 500,
    expres: 500,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getAuthStatus. Test #${tag}`, async () => {
      let result = getAuthStatus(args)
      expect(result).toBe(expres)
    })
  }
})
