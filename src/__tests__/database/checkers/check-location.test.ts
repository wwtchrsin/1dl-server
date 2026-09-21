import { checkLocation } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.minLen,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[limits.message.region.values.length - 1],
      tag: examples.tag.maxLen,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      tag: examples.tag.regLen,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.tooShort,
    },
    expres: "wrongValue.message.tag",
  }, {
    tag: 5,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.tooLong,
    },
    expres: "wrongValue.message.tag",
  }, {
    tag: 6,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.wrongSymbols,
    },
    expres: "wrongValue.message.tag",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkLocation. Test #${tag}`, () => {
      let result = checkLocation(args)
      expect(result).toEqual(expres)
    })
  }
})

