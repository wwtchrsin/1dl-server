import { getStatusCode } from "../../lib/error-messages"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: ["wrongValue.message.region"],
    expres: 400,
  }, {
    tag: 2,
    args: ["wrongValue.message.index", 200],
    expres: 400,
  }, {
    tag: 3,
    args: ["wrongValue.user.login"],
    expres: 400,
  }, {
    tag: 4,
    args: ["wrongValue.user.password"],
    expres: 400,
  }, {
    tag: 5,
    args: ["wrongValue.auth.login"],
    expres: 400,
  }, {
    tag: 6,
    args: ["wrongValue.auth.header"],
    expres: 401,
  }, {
    tag: 7,
    args: ["appError.actionNotAllowed"],
    expres: 403,
  }, {
    tag: 8,
    args: ["databaseError.getMessages"],
    expres: 500,
  }, {
    tag: 9,
    args: ["databaseError.deleteSession", 200],
    expres: 500,
  }, {
    tag: 10,
    args: ["databaseConflict.messageNotFound", 200],
    expres: 404,
  }, {
    tag: 11,
    args: ["databaseConflict.messageAlreadyExists", 200],
    expres: 409,
  }, {
    tag: 12,
    args: ["wrongValue.message.regionabcd"],
    expres: 500,
  }, {
    tag: 13,
    args: ["wrongValue.abcd"],
    expres: 500,
  }, {
    tag: 14,
    args: ["appError.abcd"],
    expres: 500,
  }, {
    tag: 15,
    args: ["databaseError.abcd"],
    expres: 500,
  }, {
    tag: 16,
    args: ["databaseConflict.abcd", 200],
    expres: 500,
  }, {
    tag: 17,
    args: ["databaseConflict.abcd"],
    expres: 500,
  }, {
    tag: 18,
    args: ["abcd"],
    expres: 500,
  }, {
    tag: 19,
    args: ["abcd", 200],
    expres: 500,
  }, {
    tag: 20,
    args: [undefined],
    expres: 200,
  }, {
    tag: 21,
    args: [undefined, 201],
    expres: 201,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getStatusCode. Test #${tag}`, () => {
      let result = getStatusCode(...(args as [string | undefined, number | undefined]))
      expect(result).toBe(expres)
    })
  }
})
    
