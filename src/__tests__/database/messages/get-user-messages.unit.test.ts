import * as messages from "../../../lib/database/messages"
import * as conn from "../../../lib/database/conn"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let message = {
  region: examples.region.first,
  tag: examples.tag.minLen,
  index: limits.message.index.min,
  text: examples.text.correct[0],
  color: examples.color.first,
  timestamp: "123456789",
}

let knownUserid = examples.uuid[0]

let unknownUserid = examples.uuid[1]

let requestSucceeds = (queryString: string, queryParams: string[]) => {
  let [ userid ] = queryParams
  if ( userid === knownUserid ) {
    return Promise.resolve({ rows: [message, message] })
  }
  return Promise.resolve({ rows: [] })
}

let requestFails = () => Promise.resolve(undefined)

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: knownUserid,
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: undefined,
      data: [message, message],
    },
  }, {
    tag: 2,
    args: unknownUserid,
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 3,
    args: "abcd",
    mocks: {
      queryDatabase: requestSucceeds,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: knownUserid,
    mocks: {
      queryDatabase: requestFails,
    },
    expres: {
      error: "databaseError.getUserMessages",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tag } = testcase
    test(`Function getUserMessages. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await messages.getUserMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

      
