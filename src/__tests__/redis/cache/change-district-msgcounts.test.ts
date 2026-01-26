import * as redisConn from "../../../lib/redis/conn"
import { changeDistrictMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let stats = [{
  region: limits.message.region.values[0],
  msgcounts: {
    [limits.message.district.min + 2]: 2,
    [limits.message.district.max - 2]: 4,
  },
}, {
  region: limits.message.region.values[1],
  msgcounts: {
    [limits.message.district.min + 2]: 2,
    [limits.message.district.min + 4]: 4,
    [limits.message.district.min + 8]: 6,
    [limits.message.district.max - 8]: 8,
    [limits.message.district.max - 4]: 6,
    [limits.message.district.max - 2]: 4,
  },
}]

let requestFails = () => Promise.resolve({
  hIncrBy: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let addts = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
  }
  result.timestamp = timestamp
  return result
}

let change = (msgcounts: Record<string | number, number>, indices: number[], delta: number) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
  }
  for ( let index of indices ) {
    let key = limits.message.district.min + index
    let value = result[key] ?? "0"
    result[key] = (Number(value) + delta).toString()
  }
  result.timestamp = timestamp
  return result
}

describe("testing redis operations...", () => {
  beforeEach(async() => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let promises = []
    for ( let entry of stats ) {
      let { region, msgcounts } = entry
      let key = `${redisConn.redisns}:msgcounts:districts:${region}`
      promises.push(client.hSet(key, addts(msgcounts)))
    }
    await Promise.all(promises)
  })
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let keys = []
    for ( let entry of stats ) {
      let { region } = entry
      keys.push(`${redisConn.redisns}:msgcounts:districts:${region}`)
    }
    await client.del(keys)
  })
  let testcases = [{
    tag: 1,
    args: {
      districtids: [{
        region: stats[0].region,
        district: limits.message.district.min + 2,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      region: stats[0].region,
      value: change(stats[0].msgcounts, [2], 1),
    }],
  }, {
    tag: 2,
    args: {
      districtids: [{
        region: stats[0].region,
        district: limits.message.district.min + 2,
      }],
      delta: -1,
    },
    mocks: {},
    expres: true,
    tables: [{
      region: stats[0].region,
      value: change(stats[0].msgcounts, [2], -1),
    }],
  }, {
    tag: 3,
    args: {
      districtids: [{
        region: stats[1].region,
        district: limits.message.district.min + 2,
      }, {
        region: stats[1].region,
        district: limits.message.district.min + 4,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      region: stats[1].region,
      value: change(stats[1].msgcounts, [2, 4], 1),
    }],
  }, {
    tag: 4,
    args: {
      districtids: [{
        region: stats[1].region,
        district: limits.message.district.min + 2,
      }, {
        region: stats[1].region,
        district: limits.message.district.min + 3,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      region: stats[1].region,
      value: change(stats[1].msgcounts, [2, 3], 1),
    }],
  }, {
    tag: 5,
    args: {
      districtids: [{
        region: stats[0].region,
        district: limits.message.district.min + 2,
      }, {
        region: stats[1].region,
        district: limits.message.district.min + 2,
      }, {
        region: stats[1].region,
        district: limits.message.district.min + 4,
      }],
      delta: 2,
    },
    mocks: {},
    expres: true,
    tables: [{
      region: stats[0].region,
      value: change(stats[0].msgcounts, [2], 2),
    }, {
      region: stats[1].region,
      value: change(stats[1].msgcounts, [2, 4], 2),
    }],
  }, {
    tag: 6,
    args: {
      districtids: [{
        region: stats[0].region,
        district: limits.message.district.min + 2,
      }],
      delta: 1,
    },
    mocks: {
      getClient: requestFails,
    },
    expres: false,
    tables: [{
      region: stats[0].region,
      value: addts(stats[0].msgcounts),
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tables, tag } = testcase
    test(`Function changeDistrictMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { districtids, delta } = args
      let result = await changeDistrictMsgcounts(districtids, delta)
      expect(result).toBe(expres)
      for ( let table of tables ) {
        let { region, value } = table
        let key = `${redisConn.redisns}:msgcounts:districts:${region}`
        let dbstate = await client.hGetAll(key)
        expect(dbstate).toStrictEqual(value)
      }
    })
  }
})


