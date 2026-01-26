import * as redisConn from "../../../lib/redis/conn"
import { changeRoomMsgcounts } from "../../../lib/redis/cache"
import { limits } from "../../../lib/database/limits"

afterAll(async () => {
  let client = await redisConn.getClient()
  let keys = await client.keys(`${redisConn.redisns}:*`)
  if ( keys.length ) await client.del(keys)
  await redisConn.closeConns()
})

let stats = [{
  districtid: {
    region: limits.message.region.values[0],
    district: limits.message.district.min,
  },
  msgcounts: {
    [limits.message.room.min + 2]: 2,
    [limits.message.room.max - 2]: 4,
  },
}, {
  districtid: {
    region: limits.message.region.values[0],
    district: limits.message.district.min + 1,
  },
  msgcounts: {
    [limits.message.room.min + 2]: 2,
    [limits.message.room.min + 4]: 4,
    [limits.message.room.min + 8]: 6,
    [limits.message.room.max - 8]: 8,
    [limits.message.room.max - 4]: 6,
    [limits.message.room.max - 2]: 4,
  },
}]

let requestFails = () => Promise.resolve({
  hIncrBy: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let addts = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let room in msgcounts ) {
    result[room] = `${msgcounts[room]}`
  }
  result.timestamp = timestamp
  return result
}

let change = (msgcounts: Record<string | number, number>, indices: number[], delta: number) => {
  let result: Record<string, string> = Object.create(null)
  for ( let room in msgcounts ) {
    result[room] = `${msgcounts[room]}`
  }
  for ( let index of indices ) {
    let key = limits.message.room.min + index
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
      let { districtid, msgcounts } = entry
      let { region, district } = districtid
      let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
      promises.push(client.hSet(key, addts(msgcounts)))
    }
    await Promise.all(promises)
  })
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redisConn.getClient()
    let keys = []
    for ( let entry of stats ) {
      let { districtid } = entry
      let { region, district } = districtid
      keys.push(`${redisConn.redisns}:msgcounts:rooms:${region}:${district}`)
    }
    await client.del(keys)
  })
  let testcases = [{
    tag: 1,
    args: {
      roomids: [{
        region: stats[0].districtid.region,
        district: stats[0].districtid.district,
        room: limits.message.room.min + 2,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      districtid: stats[0].districtid,
      value: change(stats[0].msgcounts, [2], 1),
    }],
  }, {
    tag: 2,
    args: {
      roomids: [{
        region: stats[0].districtid.region,
        district: stats[0].districtid.district,
        room: limits.message.room.min + 2,
      }],
      delta: -1,
    },
    mocks: {},
    expres: true,
    tables: [{
      districtid: stats[0].districtid,
      value: change(stats[0].msgcounts, [2], -1),
    }],
  }, {
    tag: 3,
    args: {
      roomids: [{
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 2,
      }, {
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 4,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      districtid: stats[1].districtid,
      value: change(stats[1].msgcounts, [2, 4], 1),
    }],
  }, {
    tag: 4,
    args: {
      roomids: [{
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 2,
      }, {
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 3,
      }],
      delta: 1,
    },
    mocks: {},
    expres: true,
    tables: [{
      districtid: stats[1].districtid,
      value: change(stats[1].msgcounts, [2, 3], 1),
    }],
  }, {
    tag: 5,
    args: {
      roomids: [{
        region: stats[0].districtid.region,
        district: stats[0].districtid.district,
        room: limits.message.room.min + 2,
      }, {
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 2,
      }, {
        region: stats[1].districtid.region,
        district: stats[1].districtid.district,
        room: limits.message.room.min + 4,
      }],
      delta: 2,
    },
    mocks: {},
    expres: true,
    tables: [{
      districtid: stats[0].districtid,
      value: change(stats[0].msgcounts, [2], 2),
    }, {
      districtid: stats[1].districtid,
      value: change(stats[1].msgcounts, [2, 4], 2),
    }],
  }, {
    tag: 6,
    args: {
      roomids: [{
        region: stats[0].districtid.region,
        district: stats[0].districtid.district,
        room: limits.message.room.min + 2,
      }],
      delta: 1,
    },
    mocks: {
      getClient: requestFails,
    },
    expres: false,
    tables: [{
      districtid: stats[0].districtid,
      value: addts(stats[0].msgcounts),
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, mocks, expres, tables, tag } = testcase
    test(`Function changeRoomMsgcounts. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { roomids, delta } = args
      let result = await changeRoomMsgcounts(roomids, delta)
      expect(result).toBe(expres)
      for ( let table of tables ) {
        let { districtid, value } = table
        let { region, district } = districtid
        let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
        let dbstate = await client.hGetAll(key)
        expect(dbstate).toStrictEqual(value)
      }
    })
  }
})


