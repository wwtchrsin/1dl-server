import * as wsState from "./state"
import * as wsTools from "./miscs"
import logger from "../logger"
import type * as DBI from "../database/interfaces"

export const reportError = (connid: string, error: string) => {
  let client = wsState.getClient(connid)
  if ( client ) {
    logger.info({ error }, "ws/server-messages/error")
    client.send(JSON.stringify({
      type: "error",
      error: error,
    }))
  }
}

export const pingClients = () => {
  let TAG = "ws/server-messages/pingClients"
  for ( let [connid, client] of wsState.getClients() ) {
    if ( !wsState.getPingState(connid) ) {
      logger.info(`${TAG}#CONN_LOST`)
      wsState.deleteClient(connid)
      client.terminate()
      continue
    }
    wsState.setPingState(connid, false)
    client?.ping()
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const enableConnCheck = (interval: number) => {
  return setInterval(pingClients, interval)
}

export const insertMessages = (messages: DBI.Message[]) => {
  let TAG = "ws/server-messages/insertMessages"
  let messageGroups = wsTools.groupMessagesByLocation(messages)
  for ( let { location, messages } of messageGroups ) {
    let locationString = wsTools.getLocation(location)
    let clients = wsState.getClientsByLocation(locationString)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "insert-messages",
        messages: messages,
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const deleteMessages = (messageids: DBI.Messageid[]) => {
  let TAG = "ws/server-messages/deleteMessages"
  let messageGroups = wsTools.groupMessageidsByLocation(messageids)
  for ( let { location, indices } of messageGroups ) {
    let locationString = wsTools.getLocation(location)
    let clients = wsState.getClientsByLocation(locationString)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "delete-messages",
        indices: indices,
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const reportLogin = (deviceids: string[]) => {
  let TAG = "ws/server-messages/reportLogin"
  for ( let deviceid of deviceids ) {
    let clients = wsState.getClientsByDeviceid(deviceid)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "login"
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const reportLogout = (deviceids: string[]) => {
  let TAG = "ws/server-messages/reportLogout"
  for ( let deviceid of deviceids ) {
    let clients = wsState.getClientsByDeviceid(deviceid)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "logout"
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}
