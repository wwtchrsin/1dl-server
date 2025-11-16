import { getMessages } from "../actions"
import limits from "../limits"
import { databaseError } from "../../error-messages"
import { wrongValues } from "../../error-messages"

let firstRegion = limits.messages.regions[0]
let lastRegion = limits.messages.regions[limits.messages.regions.length - 1]

jest.mock("../query", () => ({
  __esModule: true,
  queryDatabase: jest.fn(async (queryString: string, queryParams: string[]) => {
    if ( queryParams[0] === firstRegion ) {
      return Promise.resolve({ rows: [] })
    }
    return Promise.resolve(undefined)
  })
}))

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: firstRegion,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 2,
    args: {
      region: firstRegion,
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 3,
    args: {
      region: lastRegion,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: {
      error: databaseError.getMessages,
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: firstRegion,
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
    },
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: firstRegion,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
    },
    expres: {
      error: wrongValues.messages.room,
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getMessages. Test #${tag}`, async () => {
      let result = await getMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
