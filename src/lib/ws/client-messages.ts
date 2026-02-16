import { randomUUID } from "node:crypto"
import * as wsState from "./state"
import { reportError } from "./server-messages"
import { getLocation } from "./miscs"
import { parseJSON } from "../miscs"
import { checkDeviceid } from "../database/checkers"
import logger from "../logger"
import type { WebSocket } from "ws"

export const onMessage = (connid: string) => 
  (messageJSON: string) => {
    let TAG = "ws/client-messages"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      reportError(connid, "wrongValue.wsMessage.json")
      logger.info({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    switch ( message.data?.type ) {
      case "set-location": {
        let location = getLocation(message.data?.location)
        if ( !location ) {
          wsState.deleteConnLocation(connid)
          reportError(connid, "wrongValue.wsMessage.location")
          logger.info({ message: messageJSON }, `${TAG}#WRONG_LOCATION`)
          return
        }
        wsState.setConnLocation(connid, location)
        return
      }
      case "set-deviceid": {
        let deviceid = message.data?.deviceid
        if ( checkDeviceid(deviceid) !== undefined ) {
          reportError(connid, "wrongValue.wsMessage.deviceid")
          logger.info({ message: messageJSON }, `${TAG}#WRONG_DEVICEID`)
          return
        }
        wsState.setConnDeviceid(connid, deviceid)
        return
      }
      default: {
        reportError(connid, "wrongValue.wsMessage.type")
        logger.info({ message: messageJSON }, `${TAG}#WRONG_MSG_TYPE`)
      }
    }
  }

  export const onClose = (connid: string) => () => {
    wsState.deleteClient(connid)
  }

  export const onError = (connid: string) => (error: any) => {
    logger.error({ error }, "ws/connection/error")
  }

  export const onPong = (connid: string) => () => {
    wsState.setPingState(connid, true)
  }

  export const onConnection = (ws: WebSocket) => {
    let connid = randomUUID()
    wsState.addClient(connid, ws)
    ws.on("message", onMessage(connid))
    ws.on("close", onClose(connid))
    ws.on("error", onError(connid))
    ws.on("pong", onPong(connid))
  }