import env from "./env"
import logger from "./logger"
import { createClient } from "redis"
import type { Message } from "./database/messages"

const { namespace } = env.redis

export const client = await createClient({
  socket: {
    host: env.redis.host,
    port: env.redis.port,
  },
  user: env.redis.user,
  password: env.redis.password,
})
.on("error", err => {
  logger.fatal(err, "redis/createClient")
  process.exit(1)
})
.connect()

export const reportMessageUpdated = async (message: Message) => {
  await client.publish(`${namespace}:ws:message`, JSON.stringify(message))
}




  

