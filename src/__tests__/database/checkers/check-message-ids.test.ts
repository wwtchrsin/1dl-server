import { checkMessageIds } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    expres: undefined
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
      index: `${limits.messages.indexMax}`,
    },
    expres: undefined
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[1],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
      index: `${limits.messages.indexMin + 1}`,
    },
    expres: undefined
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
      index: `${limits.messages.indexMax}`,
    },
    expres: "wrongValues.messages.region"
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMax + 1}`,
      room: `${limits.messages.roomMax}`,
      index: `${limits.messages.indexMax}`,
    },
    expres: "wrongValues.messages.district"
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin - 1}`,
      index: `${limits.messages.indexMin}`,
    },
    expres: "wrongValues.messages.room"
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin - 1}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 8,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMax + 1}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 9,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin + 1.5}`,
    },
    expres: "wrongValues.messages.index"
  }, {
    tag: 10,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin + 1}`,
    },
    expres: undefined
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageIds. Test #${tag}`, () => {
      let result = checkMessageIds(args)
      expect(result).toEqual(expres)
    })
  }
})
