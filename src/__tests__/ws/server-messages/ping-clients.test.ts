import { pingClients } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let users = new Map([
  [true, [{
    userid: "01",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    userid: "02",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    userid: "03",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }]],
  [false, [{
    userid: "04",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    userid: "05",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }]]
])

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wsStorage.clients.clear()
    wsStorage.usersByLocation.clear()
    wsStorage.locationByUser.clear()
    for ( let [pingState, userlist] of users ) {
      for ( let { userid, client } of userlist ) {
        wsStorage.clients.set(userid, client as unknown as WebSocket)
        wsStorage.pingState.set(userid, pingState)
      }
    }
  })
  test("Function pingClients. Test #1", () => {
    pingClients()
    let activeUsers = users.get(true)
    let inactiveUsers = users.get(false)
    expect(wsStorage.clients.size).toBe(activeUsers.length)
    for ( let activeUser of activeUsers ) {
      expect(activeUser.client.ping).toHaveBeenCalledTimes(1)
      expect(activeUser.client.terminate).toHaveBeenCalledTimes(0)
    }
    for ( let inactiveUser of inactiveUsers ) {
      expect(inactiveUser.client.ping).toHaveBeenCalledTimes(0)
      expect(inactiveUser.client.terminate).toHaveBeenCalledTimes(1)
    }
  })
})
