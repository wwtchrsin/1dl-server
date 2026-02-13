import { checkUserCredentials } from "../../../lib/database/checkers"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: examples.password.regLen,
      identifier: examples.sessionid[0],
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: "#",
      login: "#",
      password: "#",
      identifier: examples.sessionid[0],
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: "#",
      login: "#",
      password: "#",
      identifier: "#",
    },
    expres: "wrongValue.auth.identifier",
  }, {
    tag: 4,
    args: {
      login: examples.login.regLen,
      password: examples.password.regLen,
      identifier: examples.sessionid[0],
    },
    expres: "wrongValue.auth.region",
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      password: examples.password.regLen,
      identifier: examples.sessionid[0],
    },
    expres: "wrongValue.auth.login",
  }, {
    tag: 6,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      identifier: examples.sessionid[0],
    },
    expres: "wrongValue.auth.password",
  }, {
    tag: 7,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.identifier",
  }, {
    tag: 8,
    args: {
      region: {},
      login: examples.login.regLen,
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.region",
  }, {
    tag: 9,
    args: {
      region: examples.region.first,
      login: {},
      password: examples.password.regLen,
    },
    expres: "wrongValue.auth.login",
  }, {
    tag: 10,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: {},
    },
    expres: "wrongValue.auth.password",
  }, {
    tag: 11,
    args: {
      region: examples.region.first,
      login: examples.login.regLen,
      password: examples.password.regLen,
      identifier: {},
    },
    expres: "wrongValue.auth.identifier",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserCredentials. Test #${tag}`, () => {
      let result = checkUserCredentials(args)
      expect(result).toEqual(expres)
    })
  }
})
    
