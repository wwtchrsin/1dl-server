import { getMessages } from "../actions"
import limits from "../limits"
import { databaseError } from "../../error-messages"
import { wrongValues } from "../../error-messages"

jest.mock("../query")

describe("testing database query executors...", () => {
  test("Function getMessages", async () => {
    let testcases = [{
      args: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      expres: {
        error: undefined,
        data: [],
      },
    }, {
      args: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin + 1,
      },
      expres: {
        error: undefined,
        data: [],
      },
    }, {
      args: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      expres: {
        error: databaseError.messages,
        data: undefined,
      },
    }, {
      args: {
        region: "abcdefg",
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      expres: {
        error: wrongValues.messages.region,
        data: undefined,
      },
    }, {
      args: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin - 1,
        room: limits.messages.roomMin,
      },
      expres: {
        error: wrongValues.messages.district,
        data: undefined,
      },
    }, {
      args: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMax + 1,
      },
      expres: {
        error: wrongValues.messages.room,
        data: undefined,
      },
    }]
    for ( let testcase of testcases ) {
      let { args, expres } = testcase
      let result = await getMessages(args)
      expect(result).toStrictEqual(expres)
    }
  })
})
