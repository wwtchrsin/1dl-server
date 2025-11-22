import * as conn from "../../../lib/database/conn"
import * as messages from "../../../lib/database/messages"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let timestamp = 123456789
let userid = "53e291f8-522b-43b8-a5f5-84795b887a81"

let returnOneMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room, index, text, color, userid] = queryParams
  let message = {
    region: region, 
    district: Number(district),
    room: Number(room),
    index: Number(index),
    text: text,
    color: color,
    timestamp: timestamp,
  }
  return Promise.resolve({ rows: [message] })
}

let returnZeroMessages = () => Promise.resolve({ rows: [] })

let returnError = () => Promise.resolve(undefined)

let success = (args: any) => ({
  error: undefined,
  data: {
    region: args.region,
    district: Number(args.district),
    room: Number(args.room),
    index: Number(args.index),
    text: args.text,
    color: args.color,
    timestamp: timestamp,
  }
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: [
      userid,
      {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 3,
    args: [
      userid,
      {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseErrors.getMessage,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: databaseErrors.checkMessage,
      data: undefined,
    },
  }, {
    tag: 4,
    args: [
      userid,
      {
        region: "12345678",
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
  }, {
    tag: 5,
    args: [
      userid,
      {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: `${limits.messages.districtMax + 1}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
  }, {
    tag: 6,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.room,
      data: undefined,
    },
  }, {
    tag: 7,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin - 1}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.index,
      data: undefined,
    },
  }, {
    tag: 8,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin - 1),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.text,
      data: undefined,
    },
  }, {
    tag: 9,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMax + 1),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.text,
      data: undefined,
    },
  }, {
    tag: 10,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: "12345678",
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.messages.color,
      data: undefined,
    },
  }, {
    tag: 11,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: undefined,
        data: {
          rows: [{
            region: limits.messages.regions[0],
            district: limits.messages.districtMin,
            room: limits.messages.roomMin,
            index: limits.messages.indexMin,
            text: "1".repeat(limits.messages.textLenMin),
            color: limits.messages.colors[0],
            timestamp: 0,
          }]
        }
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: databaseConflicts.messageAlreadyExists,
      data: undefined,
    },
  }, {
    tag: 12,
    args: [
      "abcdefg",
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: {
      error: wrongValues.users.userid,
      data: undefined,
    },
  }, {
    tag: 13,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnZeroMessages,
    },
    expres: {
      error: databaseErrors.createMessage,
      data: undefined,
    },
  }, {
    tag: 14,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
      },
    ],
    mocks: {
      getMessage: {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      },
      queryDatabase: returnError,
    },
    expres: {
      error: databaseErrors.createMessage,
      data: undefined,
    },
  }]
  afterEach(() => {
    jest.restoreAllMocks()
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createMessage. Unit Test #${tag}`, async () => {
      jest.spyOn(messages, "getMessage").mockResolvedValue(mocks.getMessage)
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.createMessage(args[0], args[1])
      if ( expres === "success" ) {
        expect(result).toStrictEqual(success(args[1]))
        return
      }
      expect(result).toStrictEqual(expres)
    })
  }
})
