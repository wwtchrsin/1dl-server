import { checkUserCredentials } from "../../../lib/database/checkers"
import { limits, examples } from "../../../lib/database/limits"

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
    expres: "wrongValues.users.credentialsLogin",
  }, {
    tag: 4,
    args: {
      login: examples.login.regLen,
    },
    expres: "wrongValues.users.credentialsPassword",
  }, {
    tag: 5,
    args: {
      login: {},
      password: examples.password.regLen,
    },
    expres: "wrongValues.users.credentialsLogin",
  }, {
    tag: 6,
    args: {
      login: examples.login.regLen,
      password: {},
    },
    expres: "wrongValues.users.credentialsPassword",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserCredentials. Test #${tag}`, () => {
      let result = checkUserCredentials(args)
      expect(result).toEqual(expres)
    })
  }
})
    
