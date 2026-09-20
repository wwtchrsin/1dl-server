import { randomBytes } from "node:crypto"
import env from "../env"
import logger from "../logger"
import { createClient } from "redis"

export const redisns = (() => {
  if ( env.mode !== "test" ) return env.redis.namespace
  return "_" + randomBytes(12).toString("hex")
})()

type ChannelListener = (message: string, channel: string) => unknown

let client: ReturnType<typeof createClient> | undefined = undefined

let publisher: ReturnType<typeof createClient> | undefined = undefined

let subscriber: ReturnType<typeof createClient> | undefined = undefined

let knownChannels = new Set<string>([
  "messages:created",
  "messages:deleted",
  "msgcounts:districts",
  "msgcounts:zones",
  "sessions:created",
  "sessions:deleted",
])

export const getClient = async () => {
  if ( client === undefined ) {
    try {
      client = await createClient({
        socket: {
          host: env.redis.host,
          port: env.redis.port,
        },
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/client#ERROR")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getClient#CONN_ERROR")
      process.exit(1)
    }
  }
  return client
}

export const getPublisher = async () => {
  if ( publisher === undefined ) {
    try {
      publisher = await createClient({
        socket: {
          host: env.redis.host,
          port: env.redis.port,
        },
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/getPublisher#ERROR")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getPublisher#CONN_ERROR")
      process.exit(1)
    }
  }
  return publisher
}

export const getSubscriber = async () => {
  if ( subscriber === undefined ) {
    try {
      subscriber = await createClient({
        socket: {
          host: env.redis.host,
          port: env.redis.port,
        },
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/getSubscriber#ERROR")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getSubscriber#CONN_ERROR")
      process.exit(1)
    }
  }
  return subscriber
}

export const closeConns = async () => {
  if ( client !== undefined ) await client.quit()
  if ( publisher !== undefined ) await publisher.quit()
  if ( subscriber !== undefined ) await subscriber.quit()
  client = undefined
  publisher = undefined
  subscriber = undefined
}

export const publish = async (channel: string, message: Object): Promise<boolean> => {
  if ( !knownChannels.has(channel) ) {
    logger.error({ channel }, "redis/publish#UNKNOWN_CHANNEL")
    return false
  }
  try {
    let publisher = await getPublisher()
    let messageString = JSON.stringify(message)
    await publisher.publish(`${redisns}:${channel}`, messageString)
    return true
  } catch (err) {
    let errmsg = {
      args: message,
      stack: err.stack,
      message: err.message,
    }
    logger.error(errmsg, "redis/publish#ERROR")
    return false
  }
}

export const subscribe = async (channel: string, listener: ChannelListener) => {
  if ( !knownChannels.has(channel) ) {
    logger.error({ channel }, "redis/subscribe#UNKNOWN_CHANNEL")
    return
  }
  let subscriber = await getSubscriber()
  await subscriber.subscribe(`${redisns}:${channel}`, listener)
}

export const unsubscribe = async (channel: string) => {
  if ( !knownChannels.has(channel) ) {
    logger.error({ channel }, "redis/unsubscribe#UNKNOWN_CHANNEL")
    return
  }
  let subscriber = await getSubscriber()
  await subscriber.unsubscribe(`${redisns}:${channel}`)
}


