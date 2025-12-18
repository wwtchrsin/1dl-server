import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let msgsCount = [{
  room: 1,
  msgcount: 2,
}, {
  room: 2,
  msgcount: 3,
}]

let requestSuccess = () => Promise.resolve({ rows: msgsCount })

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
      district: limits.messages.districtMin,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: msgsCount,
    },
  }, {
    tag: 2,
    args: {
      region: examples.region.last,
      district: limits.messages.districtMax,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: undefined,
      data: msgsCount,
    },
  }, {
    tag: 3,
    args: {
      region: "abcd",
      district: limits.messages.districtMin,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: "wrongValues.messages.region",
      data: undefined,
    },
  }, {
    tag: 4,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMax + 1,
    },
    mocks: {
      queryDatabase: requestSuccess,
    },
    expres: {
      error: "wrongValues.messages.district",
      data: undefined,
    },
  }, {
    tag: 5,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMin,
    },
    mocks: {
      queryDatabase: requestEmptyList,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 6,
    args: {
      region: examples.region.first,
      district: limits.messages.districtMin,
    },
    mocks: {
      queryDatabase: requestFailure,
    },
    expres: {
      error: "databaseErrors.getDistrictStats",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getDistrictStats. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getDistrictStats(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
