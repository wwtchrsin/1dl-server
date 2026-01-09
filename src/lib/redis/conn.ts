import { randomBytes } from "node:crypto"
import env from "../env"
import logger from "../logger"
import { createClient } from "redis"

export const redisns = (() => {
  if ( env.mode !== "test" ) return env.redis.namespace
  return "_" + randomBytes(12).toString("hex")
})()

let client: ReturnType<typeof createClient> | undefined = undefined

let publisher: ReturnType<typeof createClient> | undefined = undefined

let subscriber: ReturnType<typeof createClient> | undefined = undefined

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
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/client#Error")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getClient#Conn_Error")
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
        username: env.redis.username,
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/getPublisher#Error")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getPublisher#Conn_Error")
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
        username: env.redis.username,
        password: env.redis.password,
        database: env.redis.database,
      })
      .on("error", err => {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "redis/getSubscriber#Error")
      })
      .connect()
    } catch (err) {
      let errmsg = {
        stack: err.stack,
        message: err.message,
      }
      logger.fatal(errmsg, "redis/getSubscriber#Conn_Error")
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

export const report = async (channel: string, message: Object): Promise<boolean> => {
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
    logger.error(errmsg, "redis/report#Error")
    return false
  }
}


