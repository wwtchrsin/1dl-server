import * as redisConn from "../../../lib/redis/conn"
import { changeDistrictMsgcount } from "../../../lib/redis/cache"
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
  hIncrBy: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
  }
  return result
}

let addts = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
  }
  result.timestamp = timestamp
  return result
}

let change = (msgcounts: Record<string | number, number>, index: number, delta: number) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
  }
  let key = limits.message.district.min + index
  result[key] = (Number(result[key]) + delta).toString()
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
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 2,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: change(msgcounts[0], 2, 1),
  }, {
    tag: 2,
    init: {
      region: limits.message.region.values[1],
      msgcounts: addts(msgcounts[1]),
    },
    args: {
      districtid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min + 4,
      },
      delta: -1,
    },
    mocks: {},
    expres: true,
    table: change(msgcounts[1], 4, -1),
  }, {
    tag: 3,
    init: {
      region: limits.message.region.values[0],
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min + 4,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: process({
      [limits.message.district.min + 4]: 1,
    }),
  }, {
    tag: 4,
    init: {
      region: limits.message.region.values[0],
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 2,
      },
      delta: 1,
    },
    mocks: {
      getClient: requestFails,
    },
    expres: false,
    table: addts(msgcounts[0]),
  }]
  for ( let testcase of testcases ) {
    let { init, args, mocks, expres, table, tag } = testcase
    test(`Function changeDistrictMsgcount. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( init ) {
        let { region, msgcounts } = init
        let key = `${redisConn.redisns}:msgcounts:districts:${region}`
        await client.hSet(key, msgcounts)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { districtid, delta } = args
      let { region } = districtid
      let key = `${redisConn.redisns}:msgcounts:districts:${region}`
      let result = await changeDistrictMsgcount(districtid, delta)
      let dbstate = await client.hGetAll(key)
      expect(result).toBe(expres)
      expect(dbstate).toStrictEqual(table)
    })
  }
})
      
    
