import { checkMessageContent } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      text: examples.text.minLen,
      color: examples.color.first,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      text: examples.text.maxLen,
      color: examples.color.last,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      text: examples.text.regLen,
      color: examples.color.some,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      text: examples.text.tooShort,
      color: examples.color.first,
    },
    expres: "wrongValues.messages.text",
  }, {
    tag: 5,
    args: {
      text: examples.text.tooLong,
      color: examples.color.first,
    },
    expres: "wrongValues.messages.text",
  }, {
    tag: 6,
    args: {
      text: examples.text.minLen,
      color: "12345678",
    },
    expres: "wrongValues.messages.color",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageContent. Test #${tag}`, () => {
      let result = checkMessageContent(args)
      expect(result).toEqual(expres)
    })
  }
})
  
      

