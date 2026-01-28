import * as redisConn from "../../../lib/redis/conn"
import { getZoneMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let districtids = [{
  region: limits.message.region.values[0],
  district: limits.message.district.min,
}, {
  region: limits.message.region.values[0],
  district: limits.message.district.min + 1,
}]

let msgcounts = [{
  [limits.message.zone.min + 2]: 2,
  [limits.message.zone.max - 2]: 4,
}, {
  [limits.message.zone.min + 2]: 2,
  [limits.message.zone.min + 4]: 4,
  [limits.message.zone.min + 8]: 6,
  [limits.message.zone.max - 8]: 8,
  [limits.message.zone.max - 4]: 6,
  [limits.message.zone.max - 2]: 4,
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
    for ( let districtid of districtids ) {
      let { region, district } = districtid
      keys.push(`${redisConn.redisns}:msgcounts:zones:${region}:${district}`)
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
    test(`Function getZoneMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( init ) {
        let { districtid, msgcounts } = init
        let { region, district } = districtid
        let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
        await client.hSet(key, msgcounts)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let result = await getZoneMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
      
      


