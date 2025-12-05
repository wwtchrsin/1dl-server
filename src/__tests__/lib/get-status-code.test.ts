import { getStatusCode } from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: ["wrongValues.messages.region"],
    expres: 400,
  }, {
    tag: 2,
    args: ["wrongValues.messages.index", 200],
    expres: 400,
  }, {
    tag: 3,
    args: ["wrongValues.users.login"],
    expres: 400,
  }, {
    tag: 4,
    args: ["wrongValues.users.password"],
    expres: 400,
  }, {
    tag: 5,
    args: ["wrongValues.auth.login"],
    expres: 400,
  }, {
    tag: 6,
    args: ["authErrors.header"],
    expres: 401,
  }, {
    tag: 7,
    args: ["databaseErrors.getMessages"],
    expres: 500,
  }, {
    tag: 8,
    args: ["databaseErrors.deleteSession", 200],
    expres: 500,
  }, {
    tag: 9,
    args: ["databaseConflicts.messageNotFound", 200],
    expres: 404,
  }, {
    tag: 10,
    args: ["databaseConflicts.messageAlreadyExists", 200],
    expres: 409,
  }, {
    tag: 11,
    args: ["wrongValues.messages.regionabcd"],
    expres: 500,
  }, {
    tag: 12,
    args: ["wrongValues.abcd"],
    expres: 500,
  }, {
    tag: 13,
    args: ["databaseErrors.abcd"],
    expres: 500,
  }, {
    tag: 14,
    args: ["databaseConflicts.abcd", 200],
    expres: 500,
  }, {
    tag: 15,
    args: ["databaseConflicts.abcd"],
    expres: 500,
  }, {
    tag: 16,
    args: ["abcd"],
    expres: 500,
  }, {
    tag: 17,
    args: ["abcd", 200],
    expres: 500,
  }, {
    tag: 18,
    args: [undefined],
    expres: 200,
  }, {
    tag: 19,
    args: [undefined, 201],
    expres: 201,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getStatusCode. Test #${tag}`, () => {
      let result = getStatusCode(...args)
      expect(result).toBe(expres)
    })
  }
})
    
