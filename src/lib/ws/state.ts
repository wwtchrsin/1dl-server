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
  let previousLocation = storage.locationByConnid.get(connid)
  if ( previousLocation ) {
    let connids = storage.connidsByLocation.get(previousLocation)
    connids.delete(connid)
    storage.locationByConnid.delete(connid)
  }
  return previousLocation
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