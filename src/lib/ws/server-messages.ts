import * as wsState from "./state"
import * as wsTools from "./miscs"
import logger from "../logger"
import type * as DatabaseTypes from "../database/interfaces"
import type { ZoneMsgcountsUpdate, DistrictMsgcountsUpdate } 
  from "../redis/interfaces"

export const reportError = (userid: string, error: string) => {
  let client = wsState.getClient(userid)
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
  for ( let [userid, client] of wsState.getClients() ) {
    if ( !wsState.getPingState(userid) ) {
      logger.info(`${TAG}#CONN_LOST`)
      wsState.deleteClient(userid)
      client.terminate()
      continue
    }
    wsState.setPingState(userid, false)
    client?.ping()
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const enableConnCheck = (interval: number) => {
  return setInterval(pingClients, interval)
}

export const insertMessages = (messages: DatabaseTypes.Message[]) => {
  let TAG = "ws/server-messages/insertMessages"
  let zoneGroups = wsTools.groupMessagesByZone(messages)
  for ( let { zoneid, messages } of zoneGroups ) {
    let location = wsTools.getZoneLocation(zoneid)
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "insert-messages",
        messages: messages,
      }))
    }
  }
  let districtGroups = wsTools.groupZonesByDistrict(messages)
  for ( let { districtid, msgcounts } of districtGroups ) {
    let location = wsTools.getDistrictLocation(districtid)
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "change-zone-msgcounts",
        msgcounts: msgcounts,
      }))
    }
  }
  let regionGroups = wsTools.groupDistrictsByRegion(messages)
  for ( let { region, msgcounts } of regionGroups ) {
    let location = wsTools.getRegionLocation({ region })
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "change-district-msgcounts",
        msgcounts: msgcounts,
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const deleteMessages = (messageids: DatabaseTypes.Messageid[]) => {
  let TAG = "ws/server-messages/deleteMessages"
  let zoneGroups = wsTools.groupMessageidsByZone(messageids)
  for ( let { zoneid, indices } of zoneGroups ) {
    let location = wsTools.getZoneLocation(zoneid)
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "delete-messages",
        indices: indices,
      }))
    }
  }
  let districtGroups = wsTools.groupZonesByDistrict(messageids)
  wsTools.modifyMsgcounts(districtGroups, x => -x)
  for ( let { districtid, msgcounts } of districtGroups ) {
    let location = wsTools.getDistrictLocation(districtid)
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "change-zone-msgcounts",
        msgcounts: msgcounts,
      }))
    }
  }
  let regionGroups = wsTools.groupDistrictsByRegion(messageids)
  wsTools.modifyMsgcounts(regionGroups, x => -x)
  for ( let { region, msgcounts } of regionGroups ) {
    let location = wsTools.getRegionLocation({ region })
    let clients = wsState.getClientsByLocation(location)
    for ( let client of clients ) {
      client.send(JSON.stringify({
        type: "change-district-msgcounts",
        msgcounts: msgcounts,
      }))
    }
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const updateZoneMsgcounts = ({ districtid, msgcounts }: ZoneMsgcountsUpdate) => {
  let TAG = "ws/server-messages/deleteMessages"
  let location = wsTools.getDistrictLocation(districtid)
  let clients = wsState.getClientsByLocation(location)
  for ( let client of clients ) {
    client.send(JSON.stringify({
      type: "update-zone-msgcounts",
      msgcounts: msgcounts,
    }))
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}

export const updateDistrictMsgcounts = ({ region, msgcounts }: DistrictMsgcountsUpdate) => {
  let TAG = "ws/server-messages/updateDistrictMsgcounts"
  let location = wsTools.getRegionLocation({ region })
  let clients = wsState.getClientsByLocation(location)
  for ( let client of clients ) {
    client.send(JSON.stringify({
      type: "update-district-msgcounts",
      msgcounts: msgcounts,
    }))
  }
  logger.debug(`${TAG}#MESSAGES_SENT`)
}