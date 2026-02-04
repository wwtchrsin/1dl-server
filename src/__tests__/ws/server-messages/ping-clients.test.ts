import { pingClients } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let conns = new Map([
  [true, [{
    connid: "01",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    connid: "02",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    connid: "03",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }]],
  [false, [{
    connid: "04",
    client: {
      ping: jest.fn(x => undefined),
      close: jest.fn(x => undefined),
      terminate: jest.fn(x => undefined),
    },
  }, {
    connid: "05",
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
    wsStorage.connidsByLocation.clear()
    wsStorage.locationByConnid.clear()
    for ( let [pingState, userlist] of conns ) {
      for ( let { connid, client } of userlist ) {
        wsStorage.clients.set(connid, client as unknown as WebSocket)
        wsStorage.pingState.set(connid, pingState)
      }
    }
  })
  test("Function pingClients. Test #1", () => {
    pingClients()
    let activeConns = conns.get(true)
    let inactiveConns = conns.get(false)
    expect(wsStorage.clients.size).toBe(activeConns.length)
    for ( let activeUser of activeConns ) {
      expect(activeUser.client.ping).toHaveBeenCalledTimes(1)
      expect(activeUser.client.terminate).toHaveBeenCalledTimes(0)
    }
    for ( let inactiveUser of inactiveConns ) {
      expect(inactiveUser.client.ping).toHaveBeenCalledTimes(0)
      expect(inactiveUser.client.terminate).toHaveBeenCalledTimes(1)
    }
  })
})
