import * as messages from "../messages"
import * as conn from "../conn"
import limits from "../limits"
import { databaseErrors, databaseConflicts } from "../../error-messages"
import { wrongValues } from "../../error-messages"

let text = "abcd efg hijk lmnop"
let userid = "53e291f8-522b-43b8-a5f5-84795b887a81"
let timestamp = 123456789

let returnOneMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room, index] = queryParams
  let message = {
    region: region, 
    district: Number(district),
    room: Number(room),
    index: Number(index),
    text: text, 
    userid: userid,
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
    userid: userid,
    timestamp: timestamp,
  }
  return Promise.resolve({ rows: [message, message] })
}


let returnEmptyList = () => Promise.resolve({ rows: [] })

let returnError = () => Promise.resolve(undefined)

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
    expres: {
      error: undefined,
      data: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
        text, userid, timestamp,
      },
    },
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
    expres: {
      error: undefined,
      data: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: limits.messages.districtMax,
        room: limits.messages.roomMax,
        index: limits.messages.indexMax,
        text, userid, timestamp,
      },
    },
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
    expres: {
      error: undefined,
      data: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin + 1,
        index: limits.messages.indexMin + 1,
        text, userid, timestamp,
      },
    },
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
    expres: {
      error: databaseConflicts.messageNotFound,
      data: undefined,
    },
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
    expres: {
      error: databaseErrors.getMessage,
      data: undefined,
    },
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
    expres: {
      error: databaseErrors.getMessage,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.messages.room,
      data: undefined,
    },
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
    expres: {
      error: wrongValues.messages.index,
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
      let result = await messages.getMessage(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
