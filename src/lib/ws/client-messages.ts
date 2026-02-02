import * as wsState from "./state"
import { reportError } from "./server-messages"
import { getLocation } from "./miscs"
import { parseJSON } from "../miscs"
import logger from "../logger"
import type { WebSocket } from "ws"

export const onMessage = (userid: string) => 
  (messageJSON: string) => {
    let TAG = "ws/client-messages"
    let message = parseJSON(messageJSON)
    if ( message.error ) {
      reportError(userid, "wrongValue.wsMessage.json")
      logger.info({ message: messageJSON }, `${TAG}#WRONG_JSON`)
      return
    }
    switch ( message.data?.type ) {
      case "set-location": {
        let location = getLocation(message.data?.location)
        if ( !location ) {
          wsState.deleteUserLocation(userid)
          reportError(userid, "wrongValue.wsMessage.location")
          logger.info({ message: messageJSON }, `${TAG}#WRONG_LOCATION`)
          return
        }
        wsState.setUserLocation(userid, location)
        return
      }
      default: {
        reportError(userid, "wrongValue.wsMessage.type")
        logger.info({ message: messageJSON }, `${TAG}#WRONG_MSG_TYPE`)
      }
    }
  }

  export const onClose = (userid: string) => () => {
    wsState.deleteClient(userid)
  }

  export const onError = (userid: string) => (error: any) => {
    logger.error({ error }, "ws/connection/error")
  }

  export const onPong = (userid: string) => () => {
    wsState.setPingState(userid, true)
  }

  export const onConnection = (ws: WebSocket, userid: string) => {
    wsState.addClient(userid, ws)
    ws.on("message", onMessage(userid))
    ws.on("close", onClose(userid))
    ws.on("error", onError(userid))
    ws.on("pong", onPong(userid))
  }