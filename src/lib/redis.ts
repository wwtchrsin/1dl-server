import { randomBytes } from "node:crypto"
import env from "./env"
import logger from "./logger"
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

export const setString = async (key: string, value: string, options: SetOptions = {}):
  Promise<{ error: boolean }> => {
    try {
      let client = await getClient()
      await client.set(`${redisns}:${key}`, value, options)
      return { error: false }
    } catch (err) {
      let errmsg = {
        key: key,
        value: value,
        options: options,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/setString#Error")
      return { error: true }
    }
}

export const setObject = async (key: string, value: any, options: SetOptions = {}):
  Promise<{ error: boolean }> => {
    try {
      let client = await getClient()
      let stringValue = JSON.stringify(value)
      await client.set(`${redisns}:${key}`, stringValue, options)
      return { error: false }
    } catch (err) {
      let errmsg = {
        key: key,
        value: value,
        options: options,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/setObject#Error")
      return { error: true }
    }
  }

export const getString = async (key: string): 
  Promise<{ error: boolean, value: string | undefined }> => {
    try {
      let client = await getClient()
      let value = (await client.get(`${redisns}:${key}`)) ?? undefined
      if ( value === undefined ) {
        return { error: false, value: undefined }
      }
      return { error: false, value: value.toString() }
    } catch (err) {
      let errmsg = {
        key: key,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/getString#Error")
      return { error: true, value: undefined }
    }
  }

export const getObject = async (key: string): 
  Promise<{ error: boolean, value: any }> => {
    try {
      let client = await getClient()
      let stringValue = (await client.get(`${redisns}:${key}`)) ?? undefined
      if ( stringValue === undefined ) {
        return { error: false, value: undefined }
      }
      return {
        error: false,
        value: JSON.parse(stringValue.toString()),
      }
    } catch (err) {
      let errmsg = {
        key: key,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/getObject#Error")
      return { error: true, value: undefined }
    }
  }

export const delValue = async (key: string): 
  Promise<{ error: boolean, value: boolean }> => {
    try {
      let client = await getClient()
      return {
        error: false,
        value: !!(await client.del(`${redisns}:${key}`)),
      }
    } catch (err) {
      let errmsg = {
        key: key,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/delValue#Error")
      return { error: true, value: false }
    }
  }

export const publishString = async (channel: string, value: string): 
  Promise<{ error: boolean }> => {
    try {
      let client = await getClient()
      await client.publish(`${redisns}:${channel}`, value)
      return { error: false }
    } catch (err) {
      let errmsg = {
        channel: channel,
        value: value,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/publishString#Error")
      return { error: true }
    }
  }

export const publishObject = async (channel: string, value: any): 
  Promise<{ error: boolean }> => {
    try {
      let client = await getClient()
      let stringValue = JSON.stringify(value)
      await client.publish(`${redisns}:${channel}`, stringValue)
      return { error: false }
    } catch (err) {
      let errmsg = {
        channel: channel,
        value: value,
        stack: err.stack,
      }
      logger.error(errmsg, "redis/publishObject#Error")
      return { error: true }
    }
  }


