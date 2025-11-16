import { checkMessageContent } from "../checkers"
import limits from "../limits"
import { wrongValues } from "../../error-messages"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
      index: `${limits.messages.indexMax}`,
      text: "1".repeat(limits.messages.textLenMax),
      color: limits.messages.colors[limits.messages.colors.length - 1],
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      region: "12345678",
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.region,
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.district,
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.room,
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin - 1}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.index,
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin - 1),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.text,
  }, {
    tag: 8,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMax + 1),
      color: limits.messages.colors[0],
    },
    expres: wrongValues.messages.text,
  }, {
    tag: 9,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin + 1),
      color: limits.messages.colors[0],
    },
    expres: undefined,
  }, {
    tag: 10,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: "12345678",
    },
    expres: wrongValues.messages.color,
  }, {
    tag: 11,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
      text: "1".repeat(limits.messages.textLenMin),
      color: limits.messages.colors[1],
    },
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageContent. Test #${tag}`, () => {
      let result = checkMessageContent(args)
      expect(result).toEqual(expres)
    })
  }
})
  
      

