import * as redisConn from "../../../lib/redis/conn"
import { changeRoomMsgcount } from "../../../lib/redis/cache"
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
  hIncrBy: () => Promise.reject(new Error("error"))
})

let timestamp = "1234567890"

let process = (msgcounts: Record<string, number>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let room in msgcounts ) {
    result[room] = `${msgcounts[room]}`
  }
  return result
}

let addts = (msgcounts: Record<string, string>) => {
  let result: Record<string, string> = Object.create(null)
  for ( let room in msgcounts ) {
    result[room] = msgcounts[room]
  }
  result.timestamp = timestamp
  return result
}

let change = (msgcounts: Record<string | number, number>, index: number, delta: number) => {
  let result = { ...msgcounts }
  let key = limits.messages.roomMin + index
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
      keys.push(`${redisConn.redisns}:msgcounts:rooms:${region}:${district}`)
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
      roomid: {
        region: districtids[0].region,
        district: districtids[0].district,
        room: limits.messages.roomMin + 2,
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
      roomid: {
        region: districtids[1].region,
        district: districtids[1].district,
        room: limits.messages.roomMin + 4,
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
      roomid: {
        region: districtids[1].region,
        district: districtids[1].district,
        room: limits.messages.roomMin + 4,
      },
      delta: 1,
    },
    mocks: {},
    expres: true,
    table: process({
      [limits.messages.roomMin + 4]: 1,
    }),
  }, {
    tag: 4,
    init: {
      districtid: districtids[0],
      msgcounts: addts(process(msgcounts[0])),
    },
    args: {
      roomid: {
        region: districtids[0].region,
        district: districtids[0].district,
        room: limits.messages.roomMin + 2,
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
    test(`Function changeRoomMsgcount. Test #${tag}`, async () => {
      let client = await redisConn.getClient()
      if ( init ) {
        let { districtid, msgcounts } = init
        let { region, district } = districtid
        let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
        await client.hSet(key, msgcounts)
      }
      if ( mocks.getClient ) {
        jest.spyOn(redisConn, "getClient").mockImplementation(mocks.getClient as any)
      }
      let { roomid, delta } = args
      let { region, district } = roomid
      let key = `${redisConn.redisns}:msgcounts:rooms:${region}:${district}`
      let result = await changeRoomMsgcount(roomid, delta)
      let dbstate = await client.hGetAll(key)
      expect(result).toBe(expres)
      expect(dbstate).toStrictEqual(table)
    })
  }
})
      
    
