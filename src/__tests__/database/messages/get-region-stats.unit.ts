import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
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
      data: stats,
    },
  }, {
    tag: 2,
    args: examples.region.last,
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: stats,
    },
  }, {
    tag: 3,
    args: "abcd",
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }, {
    tag: 4,
    args: undefined,
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }, {
    tag: 5,
    args: examples.region.first,
    mocks: {
      queryDatabase: requestEmptyList,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 6,
    args: examples.region.first,
    mocks: {
      queryDatabase: requestFailure,
    },
    expres: {
      error: "databaseErrors.getRegionStats",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getRegionStats. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getRegionStats(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

