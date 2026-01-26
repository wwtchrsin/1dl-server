import { errorMessages, wrongValues, appErrors, databaseErrors, 
  databaseConflicts } from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: "wrongValue.message.region",
    expres: wrongValues.message.region,
  }, {
    tag: 2,
    args: "wrongValue.message.text",
    expres: wrongValues.message.text,
  }, {
    tag: 3,
    args: "wrongValue.user.password",
    expres: wrongValues.user.password,
  }, {
    tag: 4,
    args: "wrongValue.auth.login",
    expres: wrongValues.auth.login,
  }, {
    tag: 5,
    args: "wrongValue.auth.sessionid",
    expres: wrongValues.auth.sessionid,
  }, {
    tag: 6,
    args: "appError.actionNotAllowed",
    expres: appErrors.actionNotAllowed,
  }, {
    tag: 7,
    args: "databaseError.checkUserExists",
    expres: databaseErrors.checkUserExists,
  }, {
    tag: 8,
    args: "databaseConflict.messageAlreadyExists",
    expres: databaseConflicts.messageAlreadyExists,
  }, {
    tag: 9,
    args: "wrongValue.message.abcd",
    expres: undefined,
  }, {
    tag: 10,
    args: "wrongValue.abcd",
    expres: undefined,
  }, {
    tag: 11,
    args: "abcd",
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getErrorMessage. Test #${tag}`, () => {
      let result = errorMessages[args]
      expect(result).toStrictEqual(expres)
    })
  }
}) 
    
