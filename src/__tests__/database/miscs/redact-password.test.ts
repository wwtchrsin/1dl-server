import { redactPassword } from "../../../lib/database/miscs"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: {
      login: "abcd",
      password: "1234",
    },
    expres: {
      login: "abcd",
      password: "[REDACTED]",
    },
  }, {
    tag: 2,
    args: {
      name: "efgh",
    },
    expres: {
      name: "efgh",
    },
  }, {
    tag: 3,
    args: {
      location: "wxyz",
      password: undefined,
    },
    expres: {
      location: "wxyz",
      password: undefined,
    },
  }, {
    tag: 4,
    args: {},
    expres: {},
  }, {
    tag: 5,
    args: [],
    expres: [],
  }, {
    tag: 6,
    args: null,
    expres: null,
  }, {
    tag: 7,
    args: "abcd",
    expres: "abcd",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function redactPassword. Test ${tag}`, async () => {
      let result = await redactPassword(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

    
      
