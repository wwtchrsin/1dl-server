import * as storage from "./state-storage"
import type { WebSocket } from "ws"

export const getUsersByLocation = (location: string): Set<string> | undefined => {
  return storage.usersByLocation.get(location)
}

export const getClientsByLocation = (location: string): WebSocket[] => {
  let userids = storage.usersByLocation.get(location)
  if ( !userids ) {
    return []
  }
  let result: WebSocket[] = []
  for ( let userid of userids ) {
    result.push(storage.clients.get(userid))
  }
  return result
}

export const setUserLocation = (userid: string, location: string): string | undefined => {
  if ( !storage.clients.has(userid) ) {
    return undefined
  }
  let previousLocation = storage.locationByUser.get(userid)
  if ( previousLocation ) {
    let users = storage.usersByLocation.get(previousLocation)
    users.delete(userid)
  }
  if ( !storage.usersByLocation.has(location) ) {
    storage.usersByLocation.set(location, new Set())
  }
  storage.usersByLocation.get(location).add(userid)
  storage.locationByUser.set(userid, location)
  return previousLocation
}

export const getUserLocation = (userid: string): string | undefined => {
  return storage.locationByUser.get(userid)
}

export const deleteUserLocation = (userid: string): string | undefined => {
  let previousLocation = storage.locationByUser.get(userid)
  if ( previousLocation ) {
    let users = storage.usersByLocation.get(previousLocation)
    users.delete(userid)
    storage.locationByUser.delete(userid)
  }
  return previousLocation
}

export const addClient = (userid: string, client: WebSocket): boolean => {
  let openConn = storage.clients.get(userid)
  openConn && openConn.close()
  deleteUserLocation(userid)
  storage.clients.set(userid, client)
  storage.pingState.set(userid, true)
  return !!openConn
}

export const getClient = (userid: string): WebSocket | undefined => {
  return storage.clients.get(userid)
}

export const getClients = (): Map<string, WebSocket> => new Map(storage.clients) 

export const deleteClient = (userid: string): boolean => {
  let client = storage.clients.get(userid)
  client && client.close()
  deleteUserLocation(userid)
  storage.clients.delete(userid)
  storage.pingState.delete(userid)
  return !!client
}

export const getPingState = (userid: string): boolean => {
  return storage.pingState.get(userid) ?? false
}

export const setPingState = (userid: string, state: boolean): boolean => {
  if ( !storage.clients.has(userid) ) {
    return false
  }
  storage.pingState.set(userid, state)
  return true
}