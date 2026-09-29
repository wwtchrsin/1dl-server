
import { deleteMessagesByTime } from "./lib/database/messages"
import { getTimestamp } from "./lib/database/miscs"
import { publish } from "./lib/redis/conn"
import env from "./lib/env"
import logger from "./lib/logger"

export const deleteExpiredMessages = async (): Promise<boolean> => {
  let TAG = "workerTasks/deleteExpiredMessages"
  let timestamp = getTimestamp() - env.lifetime.message
  let messageids = await deleteMessagesByTime(timestamp)
  if ( messageids.error ) {
    logger.info({ timestamp }, `${TAG}#ERROR_DB_QUERY`)
    return false
  }
  if ( messageids.data.length ) {
    await publish("messages:deleted", { messageids: messageids.data })
  }
  logger.debug({ timestamp, msgcount: messageids.data.length }, `${TAG}#DONE`)
  return true
}