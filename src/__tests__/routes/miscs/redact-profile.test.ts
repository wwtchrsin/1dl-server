import { redactProfile } from "../../../routes/miscs"
import { examples } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: {
      userid: examples.uuid[3],
      login: examples.login.correct[3],
      name: examples.login.correct[3],
      state: "inactive",
      puid: examples.uuid[2],
      timestamp: "123456789",
    },
    expres: {
      login: examples.login.correct[3],
      name: examples.login.correct[3],
      state: "inactive",
      puid: examples.uuid[2],
      timestamp: "123456789",
    },
  }, {
    tag: 2,
    args: {
      userid: examples.uuid[1],
      login: examples.login.correct[1],
      name: examples.login.correct[1],
      state: "inactive",
      puid: examples.uuid[0],
      timestamp: "123456789",
    },
    expres: {
      login: examples.login.correct[1],
      name: examples.login.correct[1],
      state: "inactive",
      puid: examples.uuid[0],
      timestamp: "123456789",
    },
  }, {
    tag: 3,
    args: undefined,
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function redactProfile. Test #${tag}`, async () => {
      let result = redactProfile(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
