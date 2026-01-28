import * as redisConn from "../../../lib/redis/conn"
import { getDistrictMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let msgcounts = [{
  [limits.message.district.min + 2]: 2,
  [limits.message.district.max - 2]: 4,
}, {
  [limits.message.district.min + 2]: 2,
  [limits.message.district.min + 4]: 4,
  [limits.message.district.min + 8]: 6,
  [limits.message.district.max - 8]: 8,
  [limits.message.district.max - 4]: 6,
  [limits.message.district.max - 2]: 4,
}]

let requestFails = () => Promise.resolve({
  hGetAll: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let zone in msgcounts ) {
    result[zone] = `${msgcounts[zone]}`
  }
  result.timestamp = timestamp
  return result
}

describe("testing redis operations...", () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let keys = []
    for ( let region of limits.message.region.values ) {
      keys.push(`${redisConn.redisns}:msgcounts:districts:${region}`)
    }
    await client.del(keys)
  })
  let testcases = [{
    tag: 1,
    init: {
      region: limits.message.region.values[0],
      msgcounts: process(msgcounts[0]),
    },
    args: limits.message.region.values[0],
    mocks: {},
    expres: {
      error: false,
      data: msgcounts[0],
    },
  }, {
    tag: 2,
    init: {
      region: limits.message.region.values[0],
      msgcounts: process(msgcounts[0]),
    },
    args: limits.message.region.values[1],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 3,
    init: {
      region: limits.message.region.values[0],
      msgcounts: msgcounts[0],
    },
    args: limits.message.region.values[0],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 4,
    init: {
      region: limits.message.region.values[0],
      msgcounts: process({}),
    },
    args: limits.message.region.values[0],
    mocks: {},
    expres: {
      error: false,
      data: {},
    },
  }, {
    tag: 5,
    init: undefined,
    args: limits.message.region.values[0],
    mocks: {},
    expres: {
      error: false,
      data: undefined,
    },
  }, {
    tag: 6,
    init: {
      region: limits.message.region.values[0],
      msgcounts: process(msgcounts[0]),
    },
    args: limits.message.region.values[0],
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
    test(`Function getDistrictMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( init ) {
        let { region, msgcounts } = init
        let key = `${redisConn.redisns}:msgcounts:districts:${region}`
        await client.hSet(key, msgcounts)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let result = await getDistrictMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})

      


