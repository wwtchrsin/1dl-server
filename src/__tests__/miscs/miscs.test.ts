import { errorsEqual, databaseErrors } from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [databaseErrors.getMessages, databaseErrors.getMessages],
    expres: true,
  }, {
    tag: 2,
    args: [databaseErrors.getMessage, databaseErrors.getMessages],
    expres: false,
  }, {
    tag: 3,
    args: [databaseErrors.getMessage, undefined],
    expres: false,
  }, {
    tag: 4,
    args: [undefined, databaseErrors.getMessage],
    expres: false,
  }, {
    tag: 5,
    args: [undefined, undefined],
    expres: true,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function errorsEqual. Test #${tag}`, () => {
      let result = errorsEqual(args[0], args[1])
      expect(result).toBe(expres)
    })
  }
}) 
    
