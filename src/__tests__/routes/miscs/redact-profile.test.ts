import { redactProfile } from "../../../routes/miscs"
import { examples } from "../../../lib/test-data"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: {
      userid: examples.uuid[3],
      region: examples.region.first,
      login: examples.login.correct[3],
      name: examples.name.correct[3],
      color: null,
      state: "inactive",
      puid: examples.uuid[2],
      timestamp: "123456789",
    },
    expres: {
      region: examples.region.first,
      login: examples.login.correct[3],
      name: examples.name.correct[3],
      color: null,
      state: "inactive",
      puid: examples.uuid[2],
      timestamp: "123456789",
    },
  }, {
    tag: 2,
    args: {
      userid: examples.uuid[1],
      region: examples.region.last,
      login: examples.login.correct[1],
      name: examples.name.correct[1],
      color: null,
      state: "inactive",
      puid: examples.uuid[0],
      timestamp: "123456789",
    },
    expres: {
      login: examples.login.correct[1],
      region: examples.region.last,
      name: examples.name.correct[1],
      color: null,
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
