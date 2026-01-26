import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { processDistrictMsgcounts as process } from "../../../lib/database/miscs"
import { examples } from "../../../lib/test-data"

let stats = [{
  district: 5,
  msgcount: 7,
}, {
  district: 6,
  msgcount: 8,
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
    args: examples.region.first,
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: process(stats),
    },
  }, {
    tag: 2,
    args: "abcd",
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: process(stats),
    },
  }, {
    tag: 3,
    args: examples.region.first,
    mocks: {
      queryDatabase: requestEmptyList,
    },
    expres: {
      error: undefined,
      data: process([]),
    },
  }, {
    tag: 4,
    args: examples.region.first,
    mocks: {
      queryDatabase: requestFailure,
    },
    expres: {
      error: "databaseError.countRegionMessages",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function countRegionMessages. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.countRegionMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

