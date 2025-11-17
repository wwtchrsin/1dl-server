import * as actions from "../actions"
import * as conn from "../conn"
import limits from "../limits"
import { databaseErrors } from "../../error-messages"
import { wrongValues } from "../../error-messages"

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: {
        rows: [],
      },
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
    },
    mocks: {
      queryDatabase: {
        rows: [],
      },
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
    },
    mocks: {
      queryDatabase: {
        rows: [],
      },
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: undefined,
    },
    expres: {
      error: databaseErrors.getMessages,
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: {},
    },
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: {},
    },
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
    },
    mocks: {
      queryDatabase: {},
    },
    expres: {
      error: wrongValues.messages.room,
      data: undefined,
    },
  }]
  afterEach(() => {
    jest.restoreAllMocks()
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function getMessages. Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockResolvedValue(mocks.queryDatabase)
      let result = await actions.getMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
