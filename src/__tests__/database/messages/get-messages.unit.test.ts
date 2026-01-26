import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

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
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: examples.region.first,
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
    },
    mocks: {
      queryDatabase: returnZeroMessages,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 3,
    args: {
      region: examples.region.first,
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: {
      error: "databaseError.getMessages",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: "abcdefg",
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
    },
    mocks: {
      queryDatabase: returnMessage,
    },
    expres: "success",
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
