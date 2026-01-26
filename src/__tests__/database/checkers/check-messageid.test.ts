import { checkMessageid } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min}`,
    },
    expres: undefined
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[limits.message.region.values.length - 1],
      district: `${limits.message.district.max}`,
      room: `${limits.message.room.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: undefined
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      district: `${limits.message.district.min + 1}`,
      room: `${limits.message.room.min + 1}`,
      index: `${limits.message.index.min + 1}`,
    },
    expres: undefined
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.message.district.max}`,
      room: `${limits.message.room.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValues.messages.region"
  }, {
    tag: 5,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.max + 1}`,
      room: `${limits.message.room.max}`,
      index: `${limits.message.index.max}`,
    },
    expres: "wrongValues.messages.district"
  }, {
    tag: 6,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min - 1}`,
      index: `${limits.message.index.min}`,
    },
    expres: "wrongValues.messages.room"
  }, {
    tag: 7,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min - 1}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 8,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.max + 1}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 9,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min + 1.5}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 10,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
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
