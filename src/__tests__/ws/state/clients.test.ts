import { clients, connidsByLocation, locationByConnid, pingState } 
  from "../../../lib/ws/state-storage"
import { addClient, deleteClient, getClients } from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let conns = [
  { 
    connid: examples.uuid[0], 
    location: locations[0],
    client: { close: jest.fn(x => undefined) },
  },
  {
    connid: examples.uuid[1],
    location: locations[0],
    client: { close: jest.fn(x => undefined) },
  },
  {
    connid: examples.uuid[2],
    location: locations[1],
    client: { close: jest.fn(x => undefined) },
  }, 
]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clients.clear()
    connidsByLocation.clear()
    locationByConnid.clear()
    for ( let { connid, location, client } of conns ) {
      clients.set(connid, client as unknown as WebSocket)
      locationByConnid.set(connid, location)
      if ( !connidsByLocation.has(location) ) {
        connidsByLocation.set(location, new Set())
      }
      connidsByLocation.get(location).add(connid)
      pingState.set(connid, false)
    }
  })
  test("Function addClient. Test #1", () => {
    let connid = examples.uuid[3]
    let ws = { 
      id: connid,
      client: { close: jest.fn(x => undefined) }
    }
    let initialSize = {
      clients: clients.size,
    }
    addClient(connid, ws as unknown as WebSocket)
    let client = clients.get(connid)
    expect(client).toBeDefined()
    expect(clients.size).toBe(initialSize.clients + 1)
    expect(pingState.get(connid)).toBe(true)
    expect(ws.client.close).not.toHaveBeenCalled()
  })
  test("Function deleteClient. Test #1", () => {
    let connid = conns[0].connid
    let initialSize = {
      clients: clients.size,
      locationByConnid: locationByConnid.size,
      connidsByLocation: connidsByLocation.size,
      connList: connidsByLocation.get(conns[0].location).size
    }
    let closeFunction = conns.map(conn => conn.client.close)
    let result = deleteClient(connid)
    let client = clients.get(connid)
    let connList = connidsByLocation.get(conns[0].location)
    expect(result).toBe(true)
    expect(client).toBeUndefined()
    expect(clients.size).toBe(initialSize.clients - 1)
    expect(locationByConnid.size).toBe(initialSize.locationByConnid - 1)
    expect(connidsByLocation.size).toBe(initialSize.connidsByLocation)
    expect(connList.size).toBe(initialSize.connList - 1)
    expect(closeFunction[0]).toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
  })
  test("Function deleteClient. Test #2", () => {
    let connid = examples.uuid[3]
    let initialSize = {
      clients: clients.size,
      locationByConnid: locationByConnid.size,
      connidsByLocation: connidsByLocation.size,
    }
    let closeFunction = conns.map(conn => conn.client.close)
    let result = deleteClient(connid)
    let client = clients.get(connid)
    expect(result).toBe(false)
    expect(client).toBeUndefined()
    expect(clients.size).toBe(initialSize.clients)
    expect(locationByConnid.size).toBe(initialSize.locationByConnid)
    expect(connidsByLocation.size).toBe(initialSize.connidsByLocation)
    expect(closeFunction[0]).not.toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
  })
  test("Function getClients. Test #1", () => {
    let result = getClients()
    expect(result.size).toBe(conns.length)
    for ( let [connid, _] of clients ) {
      expect(result.get(connid)).toBeDefined()
    }
  })
})
