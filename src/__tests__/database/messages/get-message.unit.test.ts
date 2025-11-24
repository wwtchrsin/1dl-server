import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import limits from "../../../lib/database/limits"
import { databaseErrors, databaseConflicts } from "../../../lib/error-messages"
import { wrongValues } from "../../../lib/error-messages"

let text = "abcd efg hijk lmnop"
let color = limits.messages.colors[0]
let puid = "53e291f8-522b-43b8-a5f5-84795b887a81"
let username = "12345678"
let timestamp = 123456789

let returnOneMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room, index] = queryParams
  let message = {
    region: region, 
    district: Number(district),
    room: Number(room),
    index: Number(index),
    text: text,
    color: color,
    puid: puid,
    username: username,
    timestamp: timestamp,
  }
  return Promise.resolve({ rows: [message] })
}

let returnTwoMessages = (queryString: string, queryParams: string[]) => {
  let [region, district, room, index] = queryParams
  let message = {
    region: region, 
    district: Number(district),
    room: Number(room),
    index: Number(index),
    text: text,
    color: color,
    puid: puid,
    username: username,
    timestamp: timestamp,
  }
  return Promise.resolve({ rows: [message, message] })
}

let returnEmptyList = () => Promise.resolve({ rows: [] })

let returnError = () => Promise.resolve(undefined)

let success = (args: any) => ({
  error: undefined,
  data: {
    region: args.region,
    district: Number(args.district),
    room: Number(args.room),
    index: Number(args.index),
    text, color, puid, username, timestamp,
  }
})

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: limits.messages.regions[limits.messages.regions.length - 1],
      district: `${limits.messages.districtMax}`,
      room: `${limits.messages.roomMax}`,
      index: `${limits.messages.indexMax}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      region: limits.messages.regions[1],
      district: `${limits.messages.districtMin + 1}`,
      room: `${limits.messages.roomMin + 1}`,
      index: `${limits.messages.indexMin + 1}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 4,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnEmptyList,
    },
    expres: databaseConflicts.messageNotFound,
  }, {
    tag: 5,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnTwoMessages,
    },
    expres: databaseErrors.getMessage,
  }, {
    tag: 6,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: databaseErrors.getMessage,
  }, {
    tag: 7,
    args: {
      region: "abcdefg",
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: wrongValues.messages.region,
  }, {
    tag: 8,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: wrongValues.messages.district,
  }, {
    tag: 9,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: wrongValues.messages.room,
  }, {
    tag: 10,
    args: {
      region: limits.messages.regions[0],
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin - 1}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: wrongValues.messages.index,
  }]
  afterEach(() => {
    jest.restoreAllMocks()
  })
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function getMessages. Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getMessage(args)
      if ( expres === "success" ) {
        expect(result).toStrictEqual(success(args))
        return
      }
      expect(result.error).toStrictEqual(expres)
      expect(result.data).toBeUndefined()
    })
  }
})
