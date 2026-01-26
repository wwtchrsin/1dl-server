import { checkRoomid } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[limits.message.region.values.length - 1],
      district: `${limits.message.district.max}`,
      room: `${limits.message.room.max}`,
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      district: `${limits.message.district.min + 1}`,
      room: `${limits.message.district.min + 1}`,
    },
    expres: undefined,
  }, {
    tag: 4,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min - 1}`,
      room: `${limits.message.room.min}`,
    },
    expres: "wrongValue.message.district",
  }, {
    tag: 5,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min - 1}`,
      room: `${limits.message.room.min}`,
    },
    expres: "wrongValue.message.district",
  }, {
    tag: 6,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min - 1}`,
    },
    expres: "wrongValue.message.room",
  }, {
    tag: 7,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min + 0.5}`,
      room: `${limits.message.room.min}`,
    },
    expres: "wrongValue.message.district",
  }, {
    tag: 8,
    args: {
      region: limits.message.region.values[0],
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min + 0.5}`,
    },
    expres: "wrongValue.message.room",
  }, {
    tag: 9,
    args: {
      region: "abcdefg",
      district: `${limits.message.district.min + 1}`,
      room: `${limits.message.room.min + 1}`,
    },
    expres: "wrongValue.message.region",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkRoomid. Test #${tag}`, () => {
      let result = checkRoomid(args)
      expect(result).toEqual(expres)
    })
  }
})

