import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let correctMessageid = {
  region: examples.region.first,
  district: `${limits.messages.districtMin}`,
  room: `${limits.messages.roomMin}`,
  index: `${limits.messages.indexMin}`,
}

let wrongRoomMessageid = {
  region: examples.region.first,
  district: `${limits.messages.districtMin}`,
  room: `${limits.messages.roomMin - 1}`,
  index: `${limits.messages.indexMin}`,
}

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [userid, region, district, room, index] = queryParams
  return Promise.resolve({
    rows: [{
      region: region,
      district: district,
      room: room,
      index: index,
      text: examples.text.correct[0],
      color: examples.color.first,
      timestamp: "123456789",
    }]
  })
}

let messageNotFound = () => {
  return Promise.resolve({ rows: [] })
}

let requestFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: [examples.uuid[0], correctMessageid],
    mocks: {
      queryDatabase: requestSucceeds
    },
    expres: "success",
  }, {
    tag: 2,
    args: ["abcd", correctMessageid],
    mocks: {
      queryDatabase: requestSucceeds
    },
    expres: "wrongValues.users.userid",
  }, {
    tag: 3,
    args: [examples.uuid[0], wrongRoomMessageid],
    mocks: {
      queryDatabase: requestSucceeds
    },
    expres: "wrongValues.messages.room",
  }, {
    tag: 4,
    args: [examples.uuid[0], correctMessageid],
    mocks: {
      queryDatabase: messageNotFound,
    },
    expres: "databaseConflicts.messageNotFound",
  }, {
    tag: 5,
    args: [examples.uuid[0], correctMessageid],
    mocks: {
      queryDatabase: requestFails,
    },
    expres: "databaseErrors.deleteMessage",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function deleteMessage. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.deleteMessage(...args)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBe(correctMessageid.region)
        expect(result.data.district).toBe(correctMessageid.district)
        expect(result.data.room).toBe(correctMessageid.room)
        expect(result.data.index).toBe(correctMessageid.index)
        expect(result.data.text).toBeDefined()
        expect(result.data.color).toBeDefined()
        expect(result.data.timestamp).toBeDefined()
     } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})
    

