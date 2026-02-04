import { onClose, onPong } from "../../../lib/ws/client-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
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

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wsStorage.clients.clear()
    wsStorage.connidsByLocation.clear()
    wsStorage.locationByConnid.clear()
    wsStorage.pingState.clear()
    for ( let { connid, location, client } of conns ) {
      wsStorage.clients.set(connid, client as unknown as WebSocket)
      wsStorage.locationByConnid.set(connid, location)
      if ( !wsStorage.connidsByLocation.has(location) ) {
        wsStorage.connidsByLocation.set(location, new Set())
      }
      wsStorage.connidsByLocation.get(location).add(connid)
      wsStorage.pingState.set(connid, false)
    }
  })
  test("Function onClose. Test #1", () => {
    let connid = conns[0].connid
    onClose(connid)()
    let client = wsStorage.clients.get(connid)
    let location = wsStorage.locationByConnid.get(connid)
    let connlist = wsStorage.connidsByLocation.get(conns[0].location)
    expect(wsStorage.clients.size).toBe(conns.length - 1)
    expect(wsStorage.locationByConnid.size).toBe(conns.length - 1)
    expect(wsStorage.connidsByLocation.size).toBe(locations.length)
    expect(client).toBeUndefined()
    expect(location).toBeUndefined()
    expect(connlist?.has(connid)).toBe(false)
    expect(conns[0].client.close).toHaveBeenCalled()
    expect(conns[1].client.close).not.toHaveBeenCalled()
    expect(conns[2].client.close).not.toHaveBeenCalled()
  })
  test("Function onClose. Test #2", () => {
    let connid = examples.uuid[3]
    onClose(connid)()
    expect(wsStorage.clients.size).toBe(conns.length)
    expect(wsStorage.locationByConnid.size).toBe(conns.length)
    expect(wsStorage.connidsByLocation.size).toBe(locations.length)
    expect(conns[0].client.close).not.toHaveBeenCalled()
    expect(conns[1].client.close).not.toHaveBeenCalled()
    expect(conns[2].client.close).not.toHaveBeenCalled()
  })
  test("Function onPong. Test #1", () => {
    let connid = conns[0].connid
    onPong(connid)()
    let pingState = wsStorage.pingState.get(connid)
    expect(pingState).toBe(true)
  })
  test("Function onPong. Test #2", () => {
    let connid = examples.uuid[3]
    onPong(connid)()
    let pingState = wsStorage.pingState.get(connid)
    expect(pingState).toBeUndefined()
  })
})
