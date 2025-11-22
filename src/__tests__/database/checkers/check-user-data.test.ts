import { checkUserData } from "../../../lib/database/checkers"
import limits from "../../../lib/database/limits"
import { wrongValues } from "../../../lib/error-messages"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      login: "1".repeat(limits.users.loginLenMax),
      password: "aA!12345".repeat(3),
      name: "1".repeat(limits.users.nameLenMax),
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      login: "1".repeat(limits.users.loginLenMin + 1),
      password: "aA!123456",
      name: "1".repeat(limits.users.nameLenMin + 1),
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      login: "-_AaBbYyZz0189",
      password: "bB@#$%^&*_-+=5",
      name: "Abc 0189-=<{[\\~",
    },
    expres: undefined,
  }, {
    tag: 5,
    args: {
      login: "1".repeat(limits.users.loginLenMin - 1),
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.login,
  }, {
    tag: 6,
    args: {
      login: "1".repeat(limits.users.loginLenMax + 1),
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.login,
  }, {
    tag: 7,
    args: {
      login: "1".repeat(limits.users.loginLenMin) + "%",
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.login,
  }, {
    tag: 8,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!1234",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.password,
  }, {
    tag: 9,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!12345".repeat(3) + "1",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.password,
  }, {
    tag: 10,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!<2345",
      name: "1".repeat(limits.users.nameLenMin),
    },
    expres: wrongValues.users.password,
  }, {
    tag: 11,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMin - 1),
    },
    expres: wrongValues.users.name,
  }, {
    tag: 12,
    args: {
      login: "1".repeat(limits.users.loginLenMin),
      password: "aA!12345",
      name: "1".repeat(limits.users.nameLenMax + 1),
    },
    expres: wrongValues.users.name,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkUserData. Test #${tag}`, () => {
      let result = checkUserData(args)
      expect(result).toEqual(expres)
    })
  }
})
  

