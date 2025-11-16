import { createMessage } from "../actions"
import limits from "../limits"
import { databaseError } from "../../error-messages"
import { wrongValues } from "../../error-messages"

let timestamp = 123456789
let userid = "53e291f8-522b-43b8-a5f5-84795b887a81"

jest.mock("../query", () => ({
  __esModule: true,
  queryDatabase: jest.fn(async (queryString: string, queryParams: string[]) => {
    let [region, district, room, index, text, color, id] = queryParams
    if ( id === userid ) {
      let message = { 
        region: region,
        district: Number(district),
        room: Number(room),
        index: Number(index),
        text: text,
        color: color,
        timestamp: `${timestamp}`
      }
      return Promise.resolve({ rows: [message] })
    }
    return Promise.resolve(undefined)
  })
}))

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
    expres: {
      error: undefined,
      data: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
        text: "1".repeat(limits.messages.textLenMin),
        color: limits.messages.colors[0],
        timestamp: `${timestamp}`,
      },
    },
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
    expres: {
      error: undefined,
      data: {
        region: limits.messages.regions[limits.messages.regions.length - 1],
        district: limits.messages.districtMax,
        room: limits.messages.roomMax,
        index: limits.messages.indexMax,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
        timestamp: `${timestamp}`,
      },
    },
  }, {
    tag: 3,
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
    expres: {
      error: wrongValues.messages.region,
      data: undefined,
    },
  }, {
    tag: 4,
    args: [
      userid,
      {
        region: limits.messages.regions[0],
        district: `${limits.messages.districtMax + 1}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
        text: "1".repeat(limits.messages.textLenMax),
        color: limits.messages.colors[limits.messages.colors.length - 1],
      },
    ],
    expres: {
      error: wrongValues.messages.district,
      data: undefined,
    },
  }, {
    tag: 5,
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
    expres: {
      error: wrongValues.messages.room,
      data: undefined,
    },
  }, {
    tag: 6,
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
    expres: {
      error: wrongValues.messages.index,
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
        index: `${limits.messages.indexMin}`,
        text: "1".repeat(limits.messages.textLenMin - 1),
        color: limits.messages.colors[0],
      },
    ],
    expres: {
      error: wrongValues.messages.text,
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
        text: "1".repeat(limits.messages.textLenMax + 1),
        color: limits.messages.colors[0],
      },
    ],
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
        text: "1".repeat(limits.messages.textLenMin),
        color: "12345678",
      },
    ],
    expres: {
      error: wrongValues.messages.color,
      data: undefined,
    },
  }, {
    tag: 10,
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
    expres: {
      error: databaseError.createMessage,
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createMessage. Test #${tag}`, async () => {
      let result = await createMessage(args[0], args[1])
      expect(result).toStrictEqual(expres)
    })
  }
})
