import { roomMsgcounts, districtMsgcounts } from "../test-data"
import { getClient, redisns } from "./conn"

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

