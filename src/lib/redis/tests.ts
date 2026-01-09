import { roomMsgcounts, districtMsgcounts } from "../test-data"
import { getClient, redisns, getSubscriber } from "./conn"

export const clearRedis = async () => {
  let client = await getClient()
  let keys = await client.keys(`${redisns}:*`)
  if ( keys.length ) await client.del(keys)
}

export const initRedisCache = async () => {
  let client = await getClient()  
  for ( let region in roomMsgcounts ) {
    for ( let district in roomMsgcounts[region] ) {
      let key = `${redisns}:msgcounts:rooms:${region}:${district}`
      let msgcounts = roomMsgcounts[region][district]
      await client.hSet(key, msgcounts)
    }
  }
  for ( let region in districtMsgcounts ) {
    let key = `${redisns}:msgcounts:districts:${region}`    
    let msgcounts = districtMsgcounts[region]
    await client.hSet(key, msgcounts)
  }
}

export const getReports = async (channel: string, reportsNum: number, timeout: number = 2000) => {
  let subscriber = await getSubscriber()
  return new Promise<any[]>((res) => {
    if ( reportsNum === 0 ) {
      res([])
      return
    }
    let reports = []
    subscriber.subscribe(`${redisns}:${channel}`, (messageString: string) => {
      let message = JSON.parse(messageString)
      reports.push(message)
      if ( reports.length === reportsNum ) {
        subscriber.unsubscribe(`${redisns}:${channel}`)
        res(reports)
      }
    })
    setTimeout(() => {
      subscriber.unsubscribe(`${redisns}:${channel}`)
      res([])
    }, timeout)
  })
}