import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

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

let toMessage = (args: any) => ({
  region: args.region,
  district: Number(args.district),
  room: Number(args.room),
  index: Number(args.index),
  text: msgData.text, 
  color: msgData.color,
  puid: msgData.puid,
  username: msgData.username,
  timestamp: msgData.timestamp,
})

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
      index: `${limits.message.index.min}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      region: examples.region.first,
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min}`,
    },
    mocks: {
      queryDatabase: returnEmptyList,
    },
    expres: "databaseConflicts.messageNotFound",
  }, {
    tag: 3,
    args: {
      region: examples.region.first,
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min}`,
    },
    mocks: {
      queryDatabase: returnTwoMessages,
    },
    expres: "databaseErrors.getMessage",
  }, {
    tag: 4,
    args: {
      region: examples.region.first,
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min}`,
    },
    mocks: {
      queryDatabase: returnError,
    },
    expres: "databaseErrors.getMessage",
  }, {
    tag: 5,
    args: {
      region: "abcdefg",
      district: `${limits.message.district.min}`,
      room: `${limits.message.room.min}`,
      index: `${limits.message.index.min}`,
    },
    mocks: {
      queryDatabase: returnOneMessage,
    },
    expres: "success",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function getMessages. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getMessage(args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toStrictEqual(toMessage(args))
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})
