import { castRoomParams } from "./actions"
import limits from "./limits"
import { wrongValues } from "../error-messages"

describe("functions that check values", () => {
  let testcases = [{
    entity: castRoomParams,
    name: "castRoomParams",
    testcases: [{
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: [
        undefined,
        {
          region: limits.messages.regions[0],
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
        }
      ],
    }, {
      args: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: [
        undefined,
        {
          region: limits.messages.regions[limits.messages.regions.length - 1],
          district: limits.messages.districtMin,
          room: limits.messages.roomMin,
        },
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.districtMax}`,
      },
      expres: [
        undefined,
        {
          region: limits.messages.regions[0],
          district: limits.messages.districtMax,
          room: limits.messages.roomMax,
        },
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: [
        wrongValues.messages.district,
        undefined
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin - 1}`,
      },
      expres: [
        wrongValues.messages.district,
        undefined
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
      },
      expres: [
        wrongValues.messages.room,
        undefined
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: [
        undefined,
        {
          region: limits.messages.regions[0],
          district: limits.messages.districtMin + 1,
          room: limits.messages.roomMin,
        }
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 0.5}`,
        room: `${limits.messages.roomMin}`,
      },
      expres: [
        wrongValues.messages.district,
        undefined
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin + 0.5}`,
      },
      expres: [
        wrongValues.messages.room,
        undefined
      ],
    }, {
      args: {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
      },
      expres: [
        undefined,
        {
          region: limits.messages.regions[0],
          district: limits.messages.districtMin + 1,
          room: limits.messages.roomMin + 1,
        }
      ],
    }, {
      args: {
        region: "abcdefg",
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
      },
      expres: [
        wrongValues.messages.region,
        undefined
      ],
    }]
  }]
  for ( let testcase of testcases ) {
    let { entity, name, testcases } = testcase
    test(`Function ${name}`, () => {
      for ( let testcase of testcases ) {
        let { args, expres } = testcase
        let result = entity(args)
        expect(result).toBeDefined()
        expect(result).toHaveLength(2)
        for ( let i=0; i < 2; i++ ) {
          if ( expres[i] === undefined ) {
            expect(result[i]).toBeUndefined()
          } else {
            expect(result[i]).toEqual(expres[i])
          }
        }
      }
    })
  }
})
  
      

