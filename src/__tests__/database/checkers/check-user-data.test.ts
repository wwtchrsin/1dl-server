import { checkUserData } from "../../../lib/database/checkers"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      login: examples.login.maxLen,
      password: examples.password.maxLen,
      name: examples.name.maxLen,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    },
    expres: undefined,
  }, {
    tag: 5,
    args: {
      login: examples.login.tooShort,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.login",
  }, {
    tag: 6,
    args: {
      login: examples.login.tooLong,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.login",
  }, {
    tag: 7,
    args: {
      login: examples.login.wrongSymbols,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.login",
  }, {
    tag: 8,
    args: {
      login: examples.login.regLen,
      password: examples.password.tooShort,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.password",
  }, {
    tag: 9,
    args: {
      login: examples.login.regLen,
      password: examples.password.tooLong,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.password",
  }, {
    tag: 10,
    args: {
      login: examples.login.regLen,
      password: examples.password.wrongSymbols,
      name: examples.name.regLen,
    },
    expres: "wrongValues.users.password",
  }, {
    tag: 11,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.tooShort,
    },
    expres: "wrongValues.users.name",
  }, {
    tag: 12,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.tooLong,
    },
    expres: "wrongValues.users.name",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserData. Test #${tag}`, () => {
      let result = checkUserData(args)
      expect(result).toEqual(expres)
    })
  }
})
  

