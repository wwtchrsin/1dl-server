import { reportLogout } from "../../../lib/ws/server-messages"
import * as wsState from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

describe("testing ws message handlers...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("Function reportLogout. Test #1", () => {
    let getClientsByDeviceid = jest.spyOn(wsState, "getClientsByDeviceid")
    let wsClients = [
      { send: jest.fn(() => undefined) },
      { send: jest.fn(() => undefined) },
    ]
    getClientsByDeviceid.mockImplementation(() => wsClients as unknown as WebSocket[])
    let deviceids = [examples.sessionid[0]]
    let message = JSON.stringify({ type: "logout" })
    reportLogout(deviceids)
    expect(getClientsByDeviceid).toHaveBeenCalledTimes(1)
    expect(getClientsByDeviceid).toHaveBeenNthCalledWith(1, deviceids[0])
    expect(wsClients[0].send).toHaveBeenCalledTimes(1)
    expect(wsClients[1].send).toHaveBeenCalledTimes(1)
    expect(wsClients[0].send).toHaveBeenNthCalledWith(1, message)
    expect(wsClients[1].send).toHaveBeenNthCalledWith(1, message)
  })
  test("Function reportLogout. Test #2", () => {
    let getClientsByDeviceid = jest.spyOn(wsState, "getClientsByDeviceid")
    let wsClients = [
      { send: jest.fn(() => undefined) },
      { send: jest.fn(() => undefined) },
    ]
    getClientsByDeviceid.mockImplementation(() => wsClients as unknown as WebSocket[])
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    let message = JSON.stringify({ type: "logout" })
    reportLogout(deviceids)
    expect(getClientsByDeviceid).toHaveBeenCalledTimes(2)
    expect(getClientsByDeviceid).toHaveBeenNthCalledWith(1, deviceids[0])
    expect(getClientsByDeviceid).toHaveBeenNthCalledWith(2, deviceids[1])
    expect(wsClients[0].send).toHaveBeenCalledTimes(2)
    expect(wsClients[1].send).toHaveBeenCalledTimes(2)
    expect(wsClients[0].send).toHaveBeenNthCalledWith(1, message)
    expect(wsClients[0].send).toHaveBeenNthCalledWith(2, message)
    expect(wsClients[1].send).toHaveBeenNthCalledWith(1, message)
    expect(wsClients[1].send).toHaveBeenNthCalledWith(2, message)
  })
  test("Function reportLogout. Test #3", () => {
    let getClientsByDeviceid = jest.spyOn(wsState, "getClientsByDeviceid")
    let wsClients = []
    getClientsByDeviceid.mockImplementation(() => wsClients as unknown as WebSocket[])
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    reportLogout(deviceids)
    expect(getClientsByDeviceid).toHaveBeenCalledTimes(2)
    expect(getClientsByDeviceid).toHaveBeenNthCalledWith(1, deviceids[0])
    expect(getClientsByDeviceid).toHaveBeenNthCalledWith(2, deviceids[1])
  })
  test("Function reportLogout. Test #4", () => {
    let getClientsByDeviceid = jest.spyOn(wsState, "getClientsByDeviceid")
    let wsClients = [
      { send: jest.fn(() => undefined) },
      { send: jest.fn(() => undefined) },
    ]
    getClientsByDeviceid.mockImplementation(() => wsClients as unknown as WebSocket[])
    let deviceids = []
    reportLogout(deviceids)
    expect(getClientsByDeviceid).toHaveBeenCalledTimes(0)
    expect(wsClients[0].send).toHaveBeenCalledTimes(0)
    expect(wsClients[1].send).toHaveBeenCalledTimes(0)
  })
})
