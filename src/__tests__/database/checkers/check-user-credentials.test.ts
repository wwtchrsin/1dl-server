import { checkUserCredentials } from "../../../lib/database/checkers"
import limits from "../../../lib/database/limits"
import { wrongValues } from "../../../lib/error-messages"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
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
      password: "Aa!11111",
    },
    expres: wrongValues.users.credentialsLogin,
  }, {
    tag: 4,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
    },
    expres: wrongValues.users.credentialsPassword,
  }, {
    tag: 5,
    args: {
      login: {},
      password: "Aa!11111",
    },
    expres: wrongValues.users.credentialsLogin,
  }, {
    tag: 6,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: {},
    },
    expres: wrongValues.users.credentialsPassword,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserCredentials. Test #${tag}`, () => {
      let result = checkUserCredentials(args)
      expect(result).toEqual(expres)
    })
  }
})
    
