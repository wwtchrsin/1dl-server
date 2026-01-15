import { clients, usersByLocation, locationByUser } 
  from "../../../lib/ws/state-storage"
import { addClient, deleteClient } from "../../../lib/ws/state"
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

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    clients.clear()
    usersByLocation.clear()
    locationByUser.clear()
    for ( let { userid, location, client } of users ) {
      clients.set(userid, client as unknown as WebSocket)
      locationByUser.set(userid, location)
      if ( !usersByLocation.has(location) ) {
        usersByLocation.set(location, new Set())
      }
      usersByLocation.get(location).add(userid)
    }
  })
  test("Function addClient. Test #1", () => {
    let userid = examples.uuid[3]
    let ws = { 
      id: userid,
      client: { close: jest.fn(x => undefined) }
    }
    let initialSize = {
      clients: clients.size,
      locationByUser: locationByUser.size,
      usersByLocation: usersByLocation.size,
    }
    let result = addClient(userid, ws as unknown as WebSocket)
    let closeFunction = users.map(user => user.client.close)
    let client = clients.get(userid)
    expect(result).toBe(false)
    expect(client).toBeDefined()
    expect(clients.size).toBe(initialSize.clients + 1)
    expect(locationByUser.size).toBe(initialSize.locationByUser)
    expect(usersByLocation.size).toBe(initialSize.usersByLocation)
    expect(closeFunction[0]).not.toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
    expect(ws.client.close).not.toHaveBeenCalled()
  })
  test("Function addClient. Test #2", () => {
    let userid = users[0].userid
    let ws = { 
      id: userid,
      client: { close: jest.fn(x => undefined) }
    }
    let initialSize = {
      clients: clients.size,
      locationByUser: locationByUser.size,
      usersByLocation: usersByLocation.size,
    }
    let result = addClient(userid, ws as unknown as WebSocket)
    let closeFunction = users.map(user => user.client.close)
    let client = clients.get(userid)
    expect(result).toBe(true)
    expect(client).toBeDefined()
    expect(clients.size).toBe(initialSize.clients)
    expect(locationByUser.size).toBe(initialSize.locationByUser)
    expect(usersByLocation.size).toBe(initialSize.usersByLocation)
    expect(closeFunction[0]).toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
    expect(ws.client.close).not.toHaveBeenCalled()
  })
  test("Function deleteClient. Test #1", () => {
    let userid = users[0].userid
    let initialSize = {
      clients: clients.size,
      locationByUser: locationByUser.size,
      usersByLocation: usersByLocation.size,
      userList: usersByLocation.get(users[0].location).size
    }
    let closeFunction = users.map(user => user.client.close)
    let result = deleteClient(userid)
    let client = clients.get(userid)
    let userList = usersByLocation.get(users[0].location)
    expect(result).toBe(true)
    expect(client).toBeUndefined()
    expect(clients.size).toBe(initialSize.clients - 1)
    expect(locationByUser.size).toBe(initialSize.locationByUser - 1)
    expect(usersByLocation.size).toBe(initialSize.usersByLocation)
    expect(userList.size).toBe(initialSize.userList - 1)
    expect(closeFunction[0]).toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
  })
  test("Function deleteClient. Test #2", () => {
    let userid = examples.uuid[3]
    let initialSize = {
      clients: clients.size,
      locationByUser: locationByUser.size,
      usersByLocation: usersByLocation.size,
    }
    let closeFunction = users.map(user => user.client.close)
    let result = deleteClient(userid)
    let client = clients.get(userid)
    expect(result).toBe(false)
    expect(client).toBeUndefined()
    expect(clients.size).toBe(initialSize.clients)
    expect(locationByUser.size).toBe(initialSize.locationByUser)
    expect(usersByLocation.size).toBe(initialSize.usersByLocation)
    expect(closeFunction[0]).not.toHaveBeenCalled()
    expect(closeFunction[1]).not.toHaveBeenCalled()
    expect(closeFunction[2]).not.toHaveBeenCalled()
  })
})
