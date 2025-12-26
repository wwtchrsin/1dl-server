import * as redisConn from "../../../lib/redis/conn"
import { getRoomMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let districtids = [{
  region: limits.messages.regions[0],
  district: limits.messages.districtMin,
}, {
  region: limits.messages.regions[0],
  district: limits.messages.districtMin + 1,
}]

let msgcounts = [{
  [limits.messages.roomMin + 2]: 2,
  [limits.messages.roomMax - 2]: 4,
}, {
  [limits.messages.roomMin + 2]: 2,
  [limits.messages.roomMin + 4]: 4,
  [limits.messages.roomMin + 8]: 6,
  [limits.messages.roomMax - 8]: 8,
  [limits.messages.roomMax - 4]: 6,
  [limits.messages.roomMax - 2]: 4,
}]

let requestFails = () => Promise.resolve({
  hGetAll: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let room in msgcounts ) {
    result[room] = `${msgcounts[room]}`
  }
  result.timestamp = timestamp
  return result
}

describe("testing redis operations...", () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let keys = []
    for ( let districtid of districtids ) {
      let { region, district } = districtid
      keys.push(`${redisConn.redisns}:msgcounts:rooms:${region}:${district}`)
    }
    await client.del(keys)
  })
  let testcases = [{
    tag: 1,
    init: {
      districtid: districtids[0],
      msgcounts: process(msgcounts[0]),
    },
    args: districtids[0],
    mocks: {},
    expres: {
      error: false,
      data: msgcounts[0],
    },
  }, {
    tag: 2,
    init: {
      districtid: districtids[0],
      msgcounts: process(msgcounts[0]),
    },
    args: districtids[1],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 3,
    init: {
      districtid: districtids[0],
      msgcounts: msgcounts[0],
    },
    args: districtids[0],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 4,
    init: {
      districtid: districtids[0],
      msgcounts: process({}),
    },
    args: districtids[0],
    mocks: {},
    expres: {
      error: false,
      data: {},
    },
  }, {
    tag: 5,
    init: undefined,
    args: districtids[0],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 6,
    init: {
      districtid: districtids[0],
      msgcounts: process(msgcounts[0]),
    },
    args: districtids[0],
    mocks: {
      getClient: requestFails,
    },
    expres: {
      error: true,
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { init, args, mocks, expres, tag } = testcase
    test(`Function getRoomMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( init ) {
        let { districtid, msgcounts } = init
        let { region, district } = districtid
        let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
        await client.hSet(key, msgcounts)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient)
      }
      let result = await getRoomMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
      
      


