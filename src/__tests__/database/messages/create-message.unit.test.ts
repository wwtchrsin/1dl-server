import * as conn from "../../../lib/database/conn"
import * as messages from "../../../lib/database/messages"
import { limits, patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let timestamp = 123456789
let userid = examples.uuid[0]

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

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
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
        region: examples.region.last,
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      }, {
        text: "1".repeat(limits.messages.textLenMax),
        color: examples.color.last,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
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
        region: examples.region.last,
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      }, {
        text: "1".repeat(limits.messages.textLenMax),
        color: examples.color.last,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseErrors.getMessage",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "databaseErrors.checkMessage",
  }, {
    tag: 4,
    args: [
      userid,
      {
        region: "12345678",
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      }, {
        text: "1".repeat(limits.messages.textLenMax),
        color: examples.color.last,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.region",
  }, {
    tag: 5,
    args: [
      userid,
      {
        region: examples.region.last,
        district: `${limits.messages.districtMax + 1}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      }, {
        text: "1".repeat(limits.messages.textLenMax),
        color: examples.color.last,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.district",
  }, {
    tag: 6,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 7,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin - 1}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.index",
  }, {
    tag: 8,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.tooShort,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.text",
  }, {
    tag: 9,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.tooLong,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.text",
  }, {
    tag: 10,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: "12345678",
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.messages.color",
  }, {
    tag: 11,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: undefined,
        data: {
          rows: [{
            region: examples.region.first,
            district: limits.messages.districtMin,
            room: limits.messages.roomMin,
            index: limits.messages.indexMin,
            text: examples.text.minLen,
            color: examples.color.first,
            timestamp: 0,
          }]
        }
      },
      queryDatabase: returnOneMessage,
    },
    expres: "databaseConflicts.messageAlreadyExists",
  }, {
    tag: 12,
    args: [
      "abcdefg",
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnOneMessage,
    },
    expres: "wrongValues.users.userid",
  }, {
    tag: 13,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnZeroMessages,
    },
    expres: "databaseErrors.createMessage",
  }, {
    tag: 14,
    args: [
      userid,
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      }, {
        text: examples.text.minLen,
        color: examples.color.first,
      },
    ],
    mocks: {
      getMessage: {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      },
      queryDatabase: returnError,
    },
    expres: "databaseErrors.createMessage",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createMessage. Unit Test #${tag}`, async () => {
      jest.spyOn(messages, "getMessage").mockResolvedValue(mocks.getMessage)
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let [ userid, messageid, content ] = args
      let result = await messages.createMessage(userid, messageid, content)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBe(messageid.region)
        expect(`${result.data.district}`).toBe(messageid.district)
        expect(`${result.data.room}`).toBe(messageid.room)
        expect(`${result.data.index}`).toBe(messageid.index)
        expect(result.data.text).toBe(content.text)
        expect(result.data.color).toBe(content.color)
        expect(`${result.data.timestamp}`).toMatch(patterns.timestamp)
        return
      }
      expect(result.error).toBe(expres)
      expect(result.data).toBeUndefined()
    })
  }
})
