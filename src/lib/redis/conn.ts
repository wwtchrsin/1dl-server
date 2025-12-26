import { randomBytes } from "node:crypto"
import env from "../env"
import logger from "../logger"
import { createClient } from "redis"
import type { SetOptions } from "redis"

export const redisns = (() => {
  if ( env.mode !== "test" ) return env.redis.namespace
  return "_" + randomBytes(12).toString("hex")
})()

let client: ReturnType<typeof createClient> | undefined = undefined

let channels: ReturnType<typeof createClient> | undefined = undefined

export const getClient = async () => {
  if ( client === undefined ) {
    try {
      client = await createClient({
        socket: {
          host: env.redis.host,
          port: env.redis.port,
        },
        username: env.redis.username,
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        logger.error({ stack: err.stack }, "redis/client#Error")
      })
      .connect()
    } catch (err) {
      logger.fatal({ stack: err.stack }, "redis/getClient#Error")
      process.exit(1)
    }
  }
  return client
}

export const getChannels = async () => {
  if ( channels === undefined ) {
    try {
      channels = await createClient({
        socket: {
          host: env.redis.host,
          port: env.redis.port,
        },
        username: env.redis.username,
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        logger.error({ stack: err.stack }, "redis/channels#Error")
      })
      .connect()
    } catch (err) {
      logger.fatal({ stack: err.stack }, "redis/getChannels#Error")
      process.exit(1)
    }
  }
  return channels
}

export const closeConns = async () => {
  if ( client !== undefined ) await client.quit()
  if ( channels !== undefined ) await channels.quit()  
  client = undefined
  channels = undefined
}


