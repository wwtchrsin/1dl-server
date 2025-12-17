import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits, examples } from "../../../lib/database/limits"

let toMessage = (args: any) => ({
  region: args.region,
  district: Number(args.district),
  room: Number(args.room),
  index: 0,
  text: examples.text.correct[0],
  color: examples.color.first,
  timestamp: "123456789",
})

let toMessages = (args: any) => [toMessage(args)]

let returnMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room] = queryParams
  let message = toMessage({ region, district, room })
  return Promise.resolve({ rows: [message] })
}

let returnZeroMessages = () => Promise.resolve({ rows: [] })

let returnError = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
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
      region: examples.region.last,
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
      region: examples.region.first,
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
      region: examples.region.first,
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
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: {
      error: "databaseErrors.getMessages",
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
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }, {
    tag: 6,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: {
      error: "wrongValues.messages.district",
      data: undefined,
    },
  }, {
    tag: 7,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: {
      error: "wrongValues.messages.room",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function getMessages. Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getMessages(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toStrictEqual(toMessages(args))
      } else {
        expect(result).toStrictEqual(expres)
      }
    })
  }
})
