import { checkUserData } from "../../../lib/database/checkers"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
      login: examples.login.minLen,
      password: examples.password.minLen,
      name: examples.name.minLen,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: examples.region.last,
      login: examples.login.maxLen,
      password: examples.password.maxLen,
      name: examples.name.maxLen,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      region: examples.region.some,
      login: examples.login.correct[0],
      password: examples.password.correct[0],
      name: examples.name.correct[0],
    },
    expres: undefined,
  }, {
    tag: 5,
    args: {
      region: "abcd",
      login: examples.login.tooShort,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.region",
  }, {
    tag: 6,
    args: {
      region: examples.region.some,
      login: examples.login.tooShort,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.login",
  }, {
    tag: 7,
    args: {
      region: examples.region.some,
      login: examples.login.tooLong,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.login",
  }, {
    tag: 8,
    args: {
      region: examples.region.some,
      login: examples.login.wrongSymbols,
      password: examples.password.regLen,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.login",
  }, {
    tag: 9,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.tooShort,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.password",
  }, {
    tag: 10,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.tooLong,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.password",
  }, {
    tag: 11,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.wrongSymbols,
      name: examples.name.regLen,
    },
    expres: "wrongValue.user.password",
  }, {
    tag: 12,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.tooShort,
    },
    expres: "wrongValue.user.name",
  }, {
    tag: 13,
    args: {
      region: examples.region.some,
      login: examples.login.regLen,
      password: examples.password.regLen,
      name: examples.name.tooLong,
    },
    expres: "wrongValue.user.name",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserData. Test #${tag}`, () => {
      let result = checkUserData(args)
      expect(result).toEqual(expres)
    })
  }
})
  

