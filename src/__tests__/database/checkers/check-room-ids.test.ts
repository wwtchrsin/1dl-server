import { checkRoomIds } from "../../../lib/database/checkers"
import limits from "../../../lib/database/limits"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.districtMax}`,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin - 1}`,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin - 1}`,
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: undefined,
  }, {
    tag: 8,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin + 0.5}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 9,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin + 0.5}`,
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 10,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
    },
    expres: undefined,
  }, {
    tag: 11,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
    },
    expres: "wrongValues.messages.region",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkRoomIds. Test #${tag}`, () => {
      let result = checkRoomIds(args)
      expect(result).toEqual(expres)
    })
  }
})

