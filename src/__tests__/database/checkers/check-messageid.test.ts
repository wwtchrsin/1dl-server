import { checkMessageid } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.minLen,
      index: `${limits.message.index.min}`,
    },
    expres: undefined
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[limits.message.region.values.length - 1],
      tag: examples.tag.maxLen,
      index: `${limits.message.index.max}`,
    },
    expres: undefined
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      tag: examples.tag.regLen,
      index: `${limits.message.index.min + 1}`,
    },
    expres: undefined
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      tag: examples.tag.minLen,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValue.message.region"
  }, {
    tag: 5,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.tooShort,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValue.message.tag"
  }, {
    tag: 6,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.tooLong,
      index: `${limits.message.index.min}`,
    },
    expres: "wrongValue.message.tag"
  }, {
    tag: 7,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.regLen,
      index: `${limits.message.index.min - 1}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 8,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.regLen,
      index: `${limits.message.index.max + 1}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 9,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.regLen,
      index: `${limits.message.index.min + 1.5}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 10,
    args: {
      region: limits.message.region.values[0],
      tag: examples.tag.regLen,
      index: `${limits.message.index.min + 1}`,
    },
    expres: undefined
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageid. Test #${tag}`, () => {
      let result = checkMessageid(args)
      expect(result).toEqual(expres)
    })
  }
})
