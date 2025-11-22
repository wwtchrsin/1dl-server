import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { databaseErrors } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let text = "1".repeat(limits.messages.textLenMin)
let timestamp = "123456789"

let getMessage = (args: any) => ({
  region: args.region,
  district: Number(args.district),
  room: Number(args.room),
  index: 0,
  text: "1".repeat(limits.messages.textLenMin),
  color: limits.messages.colors[0],
  timestamp: timestamp,
})

let returnMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room] = queryParams
  let message = getMessage({ region, district, room })
  return Promise.resolve({ rows: [message] })
}

let returnZeroMessages = () => Promise.resolve({ rows: [] })

let returnError = () => Promise.resolve(undefined)

let success = (args: any) => ({
  error: undefined,
  data: [getMessage(args)],
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: "success",
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnZeroMessages,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: {
      error: databaseErrors.getMessages,
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
    },
    mocks: {
      queryDatabase: returnMessage,
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
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getMessages(args)
      if ( expres === "success" ) {
        expect(result).toStrictEqual(success(args))
        return
      }
      expect(result).toStrictEqual(expres)
    })
  }
})
