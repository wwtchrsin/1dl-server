import { checkUserCredentials } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      login: "#",
      password: "#",
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      password: examples.password.regLen,
    },
    expres: "wrongValues.auth.login",
  }, {
    tag: 4,
    args: {
      login: examples.login.regLen,
    },
    expres: "wrongValues.auth.password",
  }, {
    tag: 5,
    args: {
      login: {},
      password: examples.password.regLen,
    },
    expres: "wrongValues.auth.login",
  }, {
    tag: 6,
    args: {
      login: examples.login.regLen,
      password: {},
    },
    expres: "wrongValues.auth.password",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserCredentials. Test #${tag}`, () => {
      let result = checkUserCredentials(args)
      expect(result).toEqual(expres)
    })
  }
})
    
