import { onClose, onPong } from "../../../lib/ws/client-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let users = [
  { 
    userid: examples.uuid[0], 
    location: locations[0],
    client: { close: jest.fn(x => undefined) },
  },
  {
    userid: examples.uuid[1],
    location: locations[0],
    client: { close: jest.fn(x => undefined) },
  },
  {
    userid: examples.uuid[2],
    location: locations[1],
    client: { close: jest.fn(x => undefined) },
  }, 
]

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wsStorage.clients.clear()
    wsStorage.usersByLocation.clear()
    wsStorage.locationByUser.clear()
    wsStorage.pingState.clear()
    for ( let { userid, location, client } of users ) {
      wsStorage.clients.set(userid, client as unknown as WebSocket)
      wsStorage.locationByUser.set(userid, location)
      if ( !wsStorage.usersByLocation.has(location) ) {
        wsStorage.usersByLocation.set(location, new Set())
      }
      wsStorage.usersByLocation.get(location).add(userid)
      wsStorage.pingState.set(userid, false)
    }
  })
  test("Function onClose. Test #1", () => {
    let userid = users[0].userid
    onClose(userid)()
    let client = wsStorage.clients.get(userid)
    let location = wsStorage.locationByUser.get(userid)
    let userlist = wsStorage.usersByLocation.get(users[0].location)
    expect(wsStorage.clients.size).toBe(users.length - 1)
    expect(wsStorage.locationByUser.size).toBe(users.length - 1)
    expect(wsStorage.usersByLocation.size).toBe(locations.length)
    expect(client).toBeUndefined()
    expect(location).toBeUndefined()
    expect(userlist?.has(userid)).toBe(false)
    expect(users[0].client.close).toHaveBeenCalled()
    expect(users[1].client.close).not.toHaveBeenCalled()
    expect(users[2].client.close).not.toHaveBeenCalled()
  })
  test("Function onClose. Test #2", () => {
    let userid = examples.uuid[3]
    onClose(userid)()
    expect(wsStorage.clients.size).toBe(users.length)
    expect(wsStorage.locationByUser.size).toBe(users.length)
    expect(wsStorage.usersByLocation.size).toBe(locations.length)
    expect(users[0].client.close).not.toHaveBeenCalled()
    expect(users[1].client.close).not.toHaveBeenCalled()
    expect(users[2].client.close).not.toHaveBeenCalled()
  })
  test("Function onPong. Test #1", () => {
    let userid = users[0].userid
    onPong(userid)()
    let pingState = wsStorage.pingState.get(userid)
    expect(pingState).toBe(true)
  })
  test("Function onPong. Test #2", () => {
    let userid = examples.uuid[3]
    onPong(userid)()
    let pingState = wsStorage.pingState.get(userid)
    expect(pingState).toBeUndefined()
  })
})
