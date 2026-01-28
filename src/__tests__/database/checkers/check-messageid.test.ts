import { checkMessageid } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min}`,
      index: `${limits.message.index.min}`,
    },
    expres: undefined
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[limits.message.region.values.length - 1],
      district: `${limits.message.district.max}`,
      zone: `${limits.message.zone.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: undefined
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      district: `${limits.message.district.min + 1}`,
      zone: `${limits.message.zone.min + 1}`,
      index: `${limits.message.index.min + 1}`,
    },
    expres: undefined
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.message.district.max}`,
      zone: `${limits.message.zone.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValue.message.region"
  }, {
    tag: 5,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.max + 1}`,
      zone: `${limits.message.zone.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValue.message.district"
  }, {
    tag: 6,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min - 1}`,
      index: `${limits.message.index.min}`,
    },
    expres: "wrongValue.message.zone"
  }, {
    tag: 7,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min}`,
      index: `${limits.message.index.min - 1}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 8,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min}`,
      index: `${limits.message.index.max + 1}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 9,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min}`,
      index: `${limits.message.index.min + 1.5}`,
    },
    expres: "wrongValue.message.index"
  }, {
    tag: 10,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      zone: `${limits.message.zone.min}`,
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
