import { checkUserCredentials } from "../../../lib/database/checkers"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: "#",
      login: "#",
      password: "#",
    },
    expres: undefined,
  }, {
    tag: 1,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.region",
  }, {
    tag: 3,
    args: {
      region: examples.region.first,
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.login",
  }, {
    tag: 4,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
    },
    expres: "wrongValue.auth.password",
  }, {
    tag: 1,
    args: {
      region: {},
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.region",
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      login: {},
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.login",
  }, {
    tag: 6,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: {},
    },
    expres: "wrongValue.auth.password",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserCredentials. Test #${tag}`, () => {
      let result = checkUserCredentials(args)
      expect(result).toEqual(expres)
    })
  }
})
    
