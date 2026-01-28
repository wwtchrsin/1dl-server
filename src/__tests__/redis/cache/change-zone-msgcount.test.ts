import * as redisConn from "../../../lib/redis/conn"
import { changeZoneMsgcount } from "../../../lib/redis/cache"
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
  hIncrBy: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let zone in msgcounts ) {
    result[zone] = `${msgcounts[zone]}`
  }
  return result
}

let addts = (msgcounts: Record<string, string>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let zone in msgcounts ) {
    result[zone] = msgcounts[zone]
  }
  result.timestamp = timestamp
  return result
}

let change = (msgcounts: Record<string | number, number>, index: number, delta: number) => {
  let result = { ...msgcounts }
  let key = limits.message.zone.min + index
  result[key] = Number(result[key]) + delta
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
      msgcounts: addts(process(msgcounts[0])),
    },
    args: {
      zoneid: {
        region: districtids[0].region,
        district: districtids[0].district,
        zone: limits.message.zone.min + 2,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: addts(process(change(msgcounts[0], 2, 1))),
  }, {
    tag: 2,
    init: {
      districtid: districtids[1],
      msgcounts: addts(process(msgcounts[1])),
    },
    args: {
      zoneid: {
        region: districtids[1].region,
        district: districtids[1].district,
        zone: limits.message.zone.min + 4,
      },
      delta: -1,
    },
    mocks: {},
    expres: true,
    table: addts(process(change(msgcounts[1], 4, -1))),
  }, {
    tag: 3,
    init: {
      districtid: districtids[0],
      msgcounts: addts(process(msgcounts[0])),
    },
    args: {
      zoneid: {
        region: districtids[1].region,
        district: districtids[1].district,
        zone: limits.message.zone.min + 4,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: process({
      [limits.message.zone.min + 4]: 1,
    }),
  }, {
    tag: 4,
    init: {
      districtid: districtids[0],
      msgcounts: addts(process(msgcounts[0])),
    },
    args: {
      zoneid: {
        region: districtids[0].region,
        district: districtids[0].district,
        zone: limits.message.zone.min + 2,
      },
      delta: 1,
    },
    mocks: {
      getClient: requestFails,
    },
    expres: false,
    table: addts(process(msgcounts[0])),
  }]
  for ( let testcase of testcases ) {
    let { init, args, mocks, expres, table, tag } = testcase
    test(`Function changeZoneMsgcount. Test #${tag}`, async () => {
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
      let { zoneid, delta } = args
      let { region, district } = zoneid
      let key = `${redisConn.redisns}:msgcounts:zones:${region}:${district}`
      let result = await changeZoneMsgcount(zoneid, delta)
      let dbstate = await client.hGetAll(key)
      expect(result).toBe(expres)
      expect(dbstate).toStrictEqual(table)
    })
  }
})
      
    
