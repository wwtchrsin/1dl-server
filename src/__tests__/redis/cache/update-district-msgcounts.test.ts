import * as redisConn from "../../../lib/redis/conn"
import * as miscs from "../../../lib/database/miscs"
import { updateDistrictMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let timestamp = "1234567890"

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
  hSet: () => Promise.reject(new Error("error"))
})

let getTimestamp = () => +timestamp

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let district in msgcounts ) {
    result[district] = `${msgcounts[district]}`
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
    args: {
      region: limits.message.region.values[0],
      msgcounts: msgcounts[0],
    },
    mocks: {
      getTimestamp: getTimestamp,
    },
    expres: true,
    table: process(msgcounts[0]),
  }, {
    tag: 2,
    args: {
      region: limits.message.region.values[0],
      msgcounts: {},
    },
    mocks: {
      getTimestamp: getTimestamp,
    },
    expres: true,
    table: process({}),
  }, {
    tag: 3,
    args: {
      region: limits.message.region.values[1],
      msgcounts: msgcounts[1],
    },
    mocks: {
      getTimestamp: getTimestamp,
    },
    expres: true,
    table: process(msgcounts[1]),
  }, {
    tag: 4,
    args: {
      region: limits.message.region.values[0],
      msgcounts: msgcounts[0],
    },
    mocks: {
      getTimestamp: getTimestamp,
      getClient: requestFails,
    },
    expres: false,
    table: Object.create(null),
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, table, tag } = testcase
    test(`Function updateDistrictMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( mocks.getTimestamp ) {
        jest.spyOn(miscs, "getTimestamp").mockImplementation(mocks.getTimestamp)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { region, msgcounts } = args
      let key = `${redisConn.redisns}:msgcounts:districts:${region}`
      let result = await updateDistrictMsgcounts(region, msgcounts)
      let dbstate = await client.hGetAll(key)
      expect(result).toBe(expres)
      expect(dbstate).toStrictEqual(table)
    })
  }
})

