import * as redisConn from "../../../lib/redis/conn"
import * as miscs from "../../../lib/database/miscs"
import { updateRoomMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let timestamp = "1234567890"

let districtids = [{
  region: limits.message.region.values[0],
  district: limits.message.district.min,
}, {
  region: "abcd",
  district: "efgh",
}]

let msgcounts = [{
  [limits.message.room.min + 2]: 2,
  [limits.message.room.max - 2]: 4,
}, {
  [limits.message.room.min + 2]: 2,
  [limits.message.room.min + 4]: 4,
  [limits.message.room.min + 8]: 6,
  [limits.message.room.max - 8]: 8,
  [limits.message.room.max - 4]: 6,
  [limits.message.room.max - 2]: 4,
}]

let requestFails = () => Promise.resolve({
  hSet: () => Promise.reject(new Error("error"))
})

let getTimestamp = () => +timestamp

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
    args: {
      districtid: districtids[0],
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
      districtid: districtids[0],
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
      districtid: districtids[1],
      msgcounts: msgcounts[0],
    },
    mocks: {
      getTimestamp: getTimestamp,
    },
    expres: true,
    table: process(msgcounts[0]),
  }, {
    tag: 4,
    args: {
      districtid: districtids[0],
      msgcounts: msgcounts[1],
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
    test(`Function updateRoomMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( mocks.getTimestamp ) {
        jest.spyOn(miscs, "getTimestamp").mockImplementation(mocks.getTimestamp)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { districtid, msgcounts } = args
      let { region, district } = districtid
      let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
      let result = await updateRoomMsgcounts(districtid, msgcounts)
      let dbstate = await client.hGetAll(key)
      expect(result).toBe(expres)
      expect(dbstate).toStrictEqual(table)
    })
  }
})

