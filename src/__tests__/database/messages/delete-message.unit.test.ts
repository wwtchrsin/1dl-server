import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let correctMessageid = {
  region: examples.region.first,
  district: `${limits.message.district.min}`,
  zone: `${limits.message.zone.min}`,
  index: `${limits.message.index.min}`,
}

let requestSucceeds = (query: string, queryParams: string[]) => {
  let [userid, region, district, zone, index] = queryParams
  return Promise.resolve({
    rows: [{
      region: region,
      district: district,
      zone: zone,
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
    args: {
      uuid: examples.uuid[0],
      messageid: correctMessageid,
    },
    mocks: {
      queryDatabase: requestSucceeds
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      uuid: "abcd",
      messageid: correctMessageid
    },
    mocks: {
      queryDatabase: requestSucceeds
    },
    expres: "success",
  }, {
    tag: 3,
    args: {
      uuid: examples.uuid[0],
      messageid: correctMessageid
    },
    mocks: {
      queryDatabase: messageNotFound,
    },
    expres: "databaseConflict.messageNotFound",
  }, {
    tag: 4,
    args: {
      uuid: examples.uuid[0],
      messageid: correctMessageid
    },
    mocks: {
      queryDatabase: requestFails,
    },
    expres: "databaseError.deleteMessage",
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function deleteMessage. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.deleteMessage(args.uuid, args.messageid)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.region).toBe(correctMessageid.region)
        expect(result.data.district).toBe(correctMessageid.district)
        expect(result.data.zone).toBe(correctMessageid.zone)
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
    

