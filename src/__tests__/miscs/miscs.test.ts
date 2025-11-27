import { getErrorMessage, wrongValues, databaseErrors, databaseConflicts } 
  from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: "wrongValues.messages.region",
    expres: wrongValues.messages.region,
  }, {
    tag: 2,
    args: "wrongValues.messages.text",
    expres: wrongValues.messages.text,
  }, {
    tag: 3,
    args: "wrongValues.users.password",
    expres: wrongValues.users.password,
  }, {
    tag: 4,
    args: "databaseErrors.checkUserExists",
    expres: databaseErrors.checkUserExists,
  }, {
    tag: 5,
    args: "databaseConflicts.messageAlreadyExists",
    expres: databaseConflicts.messageAlreadyExists,
  }, {
    tag: 6,
    args: "wrongValues.messages.abcd",
    expres: undefined,
  }, {
    tag: 7,
    args: "wrongValues.abcd",
    expres: undefined,
  }, {
    tag: 8,
    args: "abcd",
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function errorsEqual. Test #${tag}`, () => {
      let result = getErrorMessage(args)
      expect(result).toStrictEqual(expres)
    })
  }
}) 
    
