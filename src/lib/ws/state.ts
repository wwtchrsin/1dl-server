import * as storage from "./state-storage"
import type { WebSocket } from "ws"

export const getConnidsByLocation = (location: string): Set<string> | undefined => {
  return storage.connidsByLocation.get(location)
}

export const getClientsByLocation = (location: string): WebSocket[] => {
  let connids = storage.connidsByLocation.get(location)
  if ( !connids ) {
    return []
  }
  let result: WebSocket[] = []
  for ( let connid of connids ) {
    result.push(storage.clients.get(connid))
  }
  return result
}

export const getConnidsByDeviceid = (deviceid: string): Set<string | undefined> => {
  return storage.connidsByDeviceid.get(deviceid)
}

export const getClientsByDeviceid = (deviceid: string): WebSocket[] => {
  let connids = storage.connidsByDeviceid.get(deviceid)
  if ( !connids ) {
    return []
  }
  let result: WebSocket[] = []
  for ( let connid of connids ) {
    result.push(storage.clients.get(connid))
  }
  return result
}

export const setConnLocation = (connid: string, location: string): string | undefined => {
  if ( !storage.clients.has(connid) ) {
    return undefined
  }
  let previousLocation = storage.locationByConnid.get(connid)
  if ( previousLocation ) {
    let connids = storage.connidsByLocation.get(previousLocation)
    connids.delete(connid)
  }
  if ( !storage.connidsByLocation.has(location) ) {
    storage.connidsByLocation.set(location, new Set())
  }
  storage.connidsByLocation.get(location).add(connid)
  storage.locationByConnid.set(connid, location)
  return previousLocation
}

export const getConnLocation = (connid: string): string | undefined => {
  return storage.locationByConnid.get(connid)
}

export const deleteConnLocation = (connid: string): string | undefined => {
  let location = storage.locationByConnid.get(connid)
  if ( location ) {
    let connids = storage.connidsByLocation.get(location)
    connids.delete(connid)
    storage.locationByConnid.delete(connid)
  }
  return location
}

export const setConnDeviceid = (connid: string, deviceid: string): string | undefined => {
  if ( !storage.clients.has(connid) ) {
    return undefined
  }
  if ( storage.deviceidByConnid.has(connid) ) {
    return deviceid
  }
  if ( !storage.connidsByDeviceid.has(deviceid) ) {
    storage.connidsByDeviceid.set(deviceid, new Set())
  }
  storage.deviceidByConnid.set(connid, deviceid)
  storage.connidsByDeviceid.get(deviceid).add(connid)
  return undefined
}

export const getConnDeviceid = (connid: string): string | undefined => {
  return storage.deviceidByConnid.get(connid)
}

export const deleteConnDeviceid = (connid: string): string | undefined => {
  let deviceid = storage.deviceidByConnid.get(connid)
  if ( deviceid ) {
    let connids = storage.connidsByDeviceid.get(deviceid)
    connids.delete(connid)
    storage.deviceidByConnid.delete(connid)
  }
  return deviceid
}

export const addClient = (connid: string, client: WebSocket) => {
  deleteConnLocation(connid)
  storage.clients.set(connid, client)
  storage.pingState.set(connid, true)
}

export const getClient = (connid: string): WebSocket | undefined => {
  return storage.clients.get(connid)
}

export const getClients = (): Map<string, WebSocket> => new Map(storage.clients) 

export const deleteClient = (connid: string): boolean => {
  let client = storage.clients.get(connid)
  client && client.close()
  deleteConnLocation(connid)
  deleteConnDeviceid(connid)
  storage.clients.delete(connid)
  storage.pingState.delete(connid)
  return !!client
}

export const getPingState = (connid: string): boolean => {
  return storage.pingState.get(connid) ?? false
}

export const setPingState = (connid: string, state: boolean): boolean => {
  if ( !storage.clients.has(connid) ) {
    return false
  }
  storage.pingState.set(connid, state)
  return true
}