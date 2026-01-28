import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { processZoneMsgcounts as process } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let stats = [{
  zone: 1,
  msgcount: 2,
}, {
  zone: 2,
  msgcount: 3,
}]

let requestSuccess = () => Promise.resolve({ rows: stats })

let requestEmptyList = () => Promise.resolve({ rows: [] })

let requestFailure = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      region: examples.region.first,
      district: limits.message.district.min,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: process(stats),
    },
  }, {
    tag: 2,
    args: {
      region: "abcd",
      district: limits.message.district.min,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: process(stats),
    },
  }, {
    tag: 3,
    args: {
      region: examples.region.first,
      district: limits.message.district.min,
    },
    mocks: {
      queryDatabase: requestEmptyList,
    },
    expres: {
      error: undefined,
      data: process([]),
    },
  }, {
    tag: 4,
    args: {
      region: examples.region.first,
      district: limits.message.district.min,
    },
    mocks: {
      queryDatabase: requestFailure,
    },
    expres: {
      error: "databaseError.countDistrictMessages",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function countDistrictMessages. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.countDistrictMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
