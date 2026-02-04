import { redisns, getClient } from "../lib/redis/conn"

let client: any

(async () => {
  try {
    client = await getClient()
    let keys = await client.keys(`${redisns}:*`)
    if ( keys.length ) await client.del(keys)
    client.close()
    console.log("[DONE] Redis database successfully reset")
  } catch (err) {
    console.log("[ERROR] Impossible to reset redis database")
    client?.close()
  }
})()