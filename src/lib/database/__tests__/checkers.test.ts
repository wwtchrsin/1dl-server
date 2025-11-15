import { checkRoomParams } from "../checkers"
import limits from "../limits"
import { wrongValues } from "../../error-messages"

describe("testing query checkers...", () => {
  test("Function checkRoomParams", () => {
    let testcases = [{
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: undefined,
    }, {
      args: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: undefined,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.districtMax}`,
      },
      expres: undefined,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: wrongValues.messages.district,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin - 1}`,
      },
      expres: wrongValues.messages.district,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
      },
      expres: wrongValues.messages.room,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: undefined,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 0.5}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: wrongValues.messages.district,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin + 0.5}`,
      },
      expres: wrongValues.messages.room,
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
      },
      expres: undefined,
    }, {
      args: {
        region: "abcdefg",
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
      },
      expres: wrongValues.messages.region,
    }]
    for ( let testcase of testcases ) {
      let { args, expres } = testcase
      let result = checkRoomParams(args)
      expect(result).toEqual(expres)
    }
  })
})
  
      

