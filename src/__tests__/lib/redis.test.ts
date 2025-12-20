import * as redis from "../../lib/redis"

afterAll(async () => {
  await redis.closeConns()
})

let entries = [
  { key: "foo", str: '{"a":"b","c":"d"}', obj: { a: "b", c: "d" } },
  { key: "bar", str: '[1,2,3,4]', obj: [ 1, 2, 3, 4 ] },
  { key: "abc", str: '"xyz"', obj: "xyz" },
  { key: "1234567890", str: '12345', obj: 12345 }
]

let requestsFail = () => {
  return Promise.resolve({
    set: () => Promise.reject(new Error("error")),
    get: () => Promise.reject(new Error("error")),
    publish: () => Promise.reject(new Error("error")),
  })
}

describe("testing redis operations...", () => {
  afterEach(async () => {
    jest.restoreAllMocks()
    let client = await redis.getClient()
    for ( let entry of entries ) {
      await client.del(`${redis.redisns}:${entry.key}`)
      await client.unsubscribe(`${redis.redisns}:channels:${entry.key}`)
    }
  })
  test("Function setString. Test 1", async () => {
    let client = await redis.getClient()
    for ( let entry of entries ) {
      let result = await redis.setString(entry.key, entry.str)
      let value = await client.get(`${redis.redisns}:${entry.key}`)
      expect(result).toStrictEqual({ error: false })
      expect(value).toBe(entry.str)
    }
  })
  test("Function setString. Test 2", async () => {
    let client = await redis.getClient()
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.setString(entries[0].key, entries[0].str)
    let value = await client.get(`${redis.redisns}:${entries[0].key}`)
    expect(result).toStrictEqual({ error: true })
    expect(value).toBe(null)
  })
  test("Function setString. Test 3", async () => {
    let options = { PX: 125 }
    let client = await redis.getClient()
    for ( let entry of entries ) {
      let result = await redis.setString(entry.key, entry.str, options)
      let value = await client.get(`${redis.redisns}:${entry.key}`)
      expect(result).toStrictEqual({ error: false })
      expect(value).toBe(entry.str)
    }
    await new Promise((res, rej) => setTimeout(() => res(), 1000))
    for ( let entry of entries ) {
      let value = await client.get(`${redis.redisns}:${entry.key}`)
      expect(value).toBe(null)
    }
  })
  test("Function setObject. Test 1", async () => {
    let client = await redis.getClient()
    for ( let entry of entries ) {
      let result = await redis.setObject(entry.key, entry.obj)
      let stringValue = await client.get(`${redis.redisns}:${entry.key}`)
      let value = JSON.parse(stringValue)
      expect(result).toStrictEqual({ error: false })
      expect(value).toStrictEqual(entry.obj)
    }
  })
  test("Function setObject. Test 2", async () => {
    let client = await redis.getClient()
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.setObject(entries[0].key, entries[0].obj)
    let value = await client.get(`${redis.redisns}:${entries[0].key}`)
    expect(result).toStrictEqual({ error: true })
    expect(value).toBe(null)
  })
  test("Function setObject. Test 3", async () => {
    let options = { PX: 125 }
    let client = await redis.getClient()
    for ( let entry of entries ) {
      let result = await redis.setObject(entry.key, entry.obj, options)
      let stringValue = await client.get(`${redis.redisns}:${entry.key}`)
      let value = JSON.parse(stringValue)
      expect(result).toStrictEqual({ error: false })
      expect(value).toStrictEqual(entry.obj)
    }
    await new Promise((res, rej) => setTimeout(() => res(), 1000))
    for ( let entry of entries ) {
      let value = await client.get(`${redis.redisns}:${entry.key}`)
      expect(value).toBe(null)
    }
  })
  test("Function getString. Test 1", async () => {
    let client = await redis.getClient()
    for ( let entry of entries ) {
      await client.set(`${redis.redisns}:${entry.key}`, entry.str)
      let result = await redis.getString(entry.key)
      let expres = { error: false, value: entry.str }
      expect(result).toStrictEqual(expres)
    }
  })
  test("Function getString. Test 2", async () => {
    let client = await redis.getClient()
    await client.set(`${redis.redisns}:${entries[0].key}`, entries[0].str)
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.getString(entries[0].key)
    let expres = { error: true, value: undefined }
    expect(result).toStrictEqual(expres)
  })
  test("Function getString. Test 3", async () => {
    let result = await redis.getString("abcd-efgh-ijkl-mnop-qrst")
    let expres = { error: false, value: undefined }
    expect(result).toStrictEqual(expres)
  })
  test("Function getObject. Test 1", async () => {
    let client = await redis.getClient()
    for ( let entry of entries ) {
      let stringValue = JSON.stringify(entry.obj)
      await client.set(`${redis.redisns}:${entry.key}`, stringValue)
      let result = await redis.getObject(entry.key)
      let expres = { error: false, value: entry.obj }
      expect(result).toStrictEqual(expres)
    }
  })
  test("Function getObject. Test 2", async () => {
    let client = await redis.getClient()
    let stringValue = JSON.stringify(entries[0].obj)
    await client.set(`${redis.redisns}:${entries[0].key}`, stringValue)
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.getObject(entries[0].key)
    let expres = { error: true, value: undefined }
    expect(result).toStrictEqual(expres)
  })
  test("Function getObject. Test 3", async () => {
    let result = await redis.getObject("abcd-efgh-ijkl-mnop-qrst")
    let expres = { error: false, value: undefined }
    expect(result).toStrictEqual(expres)
  })
  test("Function delValue. Test 1", async () => {
    let client = await redis.getClient()
    for ( let entry of entries ) {
      await client.set(`${redis.redisns}:${entry.key}`, entry.str)
      let resultA = await redis.delValue(entry.key)
      let value = await client.get(`${redis.redisns}:${entry.key}`)
      let resultB = await redis.delValue(entry.key)
      expect(resultA).toStrictEqual({ error: false, value: true })
      expect(resultB).toStrictEqual({ error: false, value: false })
      expect(value).toBe(null)
    }
  })
  test("Function delValue. Test 2", async () => {
    let client = await redis.getClient()
    await client.set(`${redis.redisns}:${entries[0].key}`, entries[0].str)
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.delValue(entries[0].key)
    expect(result).toStrictEqual({ error: true, value: false })
  })
  test("Function publishString. Test 1", async () => {
    let channels = await redis.getChannels()
    let subscriber = jest.fn()
    let channelOuter = `channels:${entries[0].key}`
    let channelInner = `${redis.redisns}:${channelOuter}`
    await channels.subscribe(channelInner, subscriber)
    let result = await redis.publishString(channelOuter, entries[0].str)
    await new Promise((res, rej) => setTimeout(() => res(), 500))
    expect(result).toStrictEqual({ error: false })
    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith(entries[0].str,
      `${redis.redisns}:channels:${entries[0].key}`)
  })
  test("Function publishString. Test 2", async () => {
    let channels = await redis.getChannels()
    let subscriber = jest.fn()
    let channelOuter = `channels:${entries[0].key}`
    let channelInner = `${redis.redisns}:${channelOuter}`
    await channels.subscribe(channelInner, subscriber)
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.publishString(channelOuter, entries[0].str)
    await new Promise((res, rej) => setTimeout(() => res(), 500))
    expect(result).toStrictEqual({ error: true })
    expect(subscriber).toHaveBeenCalledTimes(0)
  })

  test("Function publishObject. Test 1", async () => {
    let channels = await redis.getChannels()
    let subscriber = jest.fn()
    let channelOuter = `channels:${entries[0].key}`
    let channelInner = `${redis.redisns}:${channelOuter}`
    await channels.subscribe(channelInner, subscriber)
    let stringValue = JSON.stringify(entries[0].obj)
    let result = await redis.publishObject(channelOuter, entries[0].obj)
    await new Promise((res, rej) => setTimeout(() => res(), 500))
    expect(result).toStrictEqual({ error: false })
    expect(subscriber).toHaveBeenCalledTimes(1)
    expect(subscriber).toHaveBeenCalledWith(stringValue,
      `${redis.redisns}:channels:${entries[0].key}`)
  })
  test("Function publishString. Test 2", async () => {
    let channels = await redis.getChannels()
    let subscriber = jest.fn()
    let channelOuter = `channels:${entries[0].key}`
    let channelInner = `${redis.redisns}:${channelOuter}`
    await channels.subscribe(channelInner, subscriber)
    jest.spyOn(redis, "getClient").mockImplementation(requestsFail)
    let result = await redis.publishObject(channelOuter, entries[0].obj)
    await new Promise((res, rej) => setTimeout(() => res(), 500))
    expect(result).toStrictEqual({ error: true })
    expect(subscriber).toHaveBeenCalledTimes(0)
  })
})

      
