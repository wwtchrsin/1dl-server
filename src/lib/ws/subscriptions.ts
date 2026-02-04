import * as wsState from "./state"
import * as serverMessages from "./server-messages"
import { subscribe } from "../redis/conn"
import { parseJSON } from "../miscs"
import logger from "../logger"
import type * as RedisTypes from "../redis/interfaces"

export const listeners = new Map([
  ["messages:created", (messageJSON: string) => {
    let TAG = "ws/channels/messages:created"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    if ( isNaN(message.data?.messages?.length) ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_MESSAGE`)
      return
    }
    let report = message.data as RedisTypes.CreatedMessages
    serverMessages.insertMessages(report.messages)
    logger.debug({ message: messageJSON }, `${TAG}#MESSAGE_RECEIVED`)
  }],
  ["messages:deleted", (messageJSON: string) => {
    let TAG = "ws/channels/messages:deleted"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    if ( isNaN(message.data?.messageids?.length) ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_MESSAGE`)
      return
    }
    let report = message.data as RedisTypes.DeletedMessages
    serverMessages.deleteMessages(report.messageids)
    logger.debug({ message: messageJSON }, `${TAG}#MESSAGE_RECEIVED`)
  }],
  ["msgcounts:zones", (messageJSON: string) => {
    let TAG = "ws/channels/msgcounts:zones"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    if ( !message.data.districtid || !message.data.msgcounts ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_MESSAGE`)
      return
    }
    let report = message.data as RedisTypes.ZoneMsgcountsUpdate
    serverMessages.updateZoneMsgcounts(report)
    logger.debug({ message: messageJSON }, `${TAG}#MESSAGE_RECEIVED`)
  }],
  ["msgcounts:districts", (messageJSON: string) => {
    let TAG = "ws/channels/msgcounts:districts"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    if ( !message.data.region || !message.data.msgcounts ) {
      logger.error({ message: messageJSON }, `${TAG}#WRONG_MESSAGE`)
      return
    }
    let report  = message.data as RedisTypes.DistrictMsgcountsUpdate
    serverMessages.updateDistrictMsgcounts(report)
    logger.debug({ message: messageJSON }, `${TAG}#MESSAGE_RECEIVED`)
  }],
])

export const subscribeServer = async () => {
  try {
    for ( let [channel, listener] of listeners ) {
      await subscribe(channel, listener)
    }
  } catch (err) {
    let errmsg = {
      stack: err.stack,
      message: err.message,
    }
    logger.fatal(errmsg, "ws/subscribeServer#ERROR")
    process.exit(1)
  }
}