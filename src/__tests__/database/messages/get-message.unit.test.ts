import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits, examples } from "../../../lib/database/limits"

let msgData = {
  text: examples.text.correct[0],
  color: examples.color.some,
  puid: examples.uuid[0],
  username: examples.name.correct[0],
  timestamp: 123456789,
}

let returnOneMessage = (queryString: string, queryParams: string[]) => {
  let [region, district, room, index] = queryParams
  let message = {
    region: region, 
    district: Number(district),
    room: Number(room),
    index: Number(index),
    text: msgData.text,
    color: msgData.color,
    puid: msgData.puid,
    username: msgData.username,
    timestamp: msgData.timestamp,
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
    text: msgData.text,
    color: msgData.color,
    puid: msgData.puid,
    username: msgData.username,
    timestamp: msgData.timestamp,
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
    text: msgData.text, 
    color: msgData.color,
    puid: msgData.puid,
    username: msgData.username,
    timestamp: msgData.timestamp,
  }
})

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
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: examples.region.last,
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
      region: examples.region.some,
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
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnEmptyList,
    },
    expres: "databaseConflicts.messageNotFound",
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnTwoMessages,
    },
    expres: "databaseErrors.getMessage",
  }, {
    tag: 6,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: "databaseErrors.getMessage",
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
    expres: "wrongValues.messages.region",
  }, {
    tag: 8,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin - 1}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 9,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMax + 1}`,
      index: `${limits.messages.indexMin}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 10,
    args: {
      region: examples.region.first,
      district: `${limits.messages.districtMin}`,
      room: `${limits.messages.roomMin}`,
      index: `${limits.messages.indexMin - 1}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.index",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function getMessages. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getMessage(args)
      if ( expres === "success" ) {
        expect(result).toStrictEqual(success(args))
        return
      }
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})
