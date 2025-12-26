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
  [limits.messages.districtMin + 2]: 2,
  [limits.messages.districtMax - 2]: 4,
}, {
  [limits.messages.districtMin + 2]: 2,
  [limits.messages.districtMin + 4]: 4,
  [limits.messages.districtMin + 8]: 6,
  [limits.messages.districtMax - 8]: 8,
  [limits.messages.districtMax - 4]: 6,
  [limits.messages.districtMax - 2]: 4,
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

let addts = (msgcounts: Record<string, string>) => {
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
  let key = limits.messages.districtMin + index
  result[key] = (Number(result[key]) + delta).toString()
  result.timestamp = timestamp
  return result
}

describe("testing redis operations...", () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let keys = []
    for ( let region of limits.messages.regions ) {
      keys.push(`${redisConn.redisns}:msgcounts:districts:${region}`)
    }
    await client.del(keys)
  })
  let testcases = [{
    tag: 1,
    init: {
      region: limits.messages.regions[0],
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 2,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: change(msgcounts[0], 2, 1),
  }, {
    tag: 2,
    init: {
      region: limits.messages.regions[1],
      msgcounts: addts(msgcounts[1]),
    },
    args: {
      districtid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 4,
      },
      delta: -1,
    },
    mocks: {},
    expres: true,
    table: change(msgcounts[1], 4, -1),
  }, {
    tag: 3,
    init: {
      region: limits.messages.regions[0],
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 4,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: process({
      [limits.messages.districtMin + 4]: "1",
    }),
  }, {
    tag: 4,
    init: {
      region: limits.messages.regions[0],
      msgcounts: addts(msgcounts[0]),
    },
    args: {
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 2,
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
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient)
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
      
    
