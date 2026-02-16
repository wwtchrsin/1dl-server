import { clients, deviceidByConnid, connidsByDeviceid } 
  from "../../../lib/ws/state-storage"
import { getConnidsByDeviceid, getClientsByDeviceid } 
  from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let deviceids = [
  examples.sessionid[0],
  examples.sessionid[1],
]

let conns = [
  { 
    connid: examples.uuid[0],
    deviceid: deviceids[0],
    client: { connid: examples.uuid[0] },
  },
  { 
    connid: examples.uuid[1],
    deviceid: deviceids[0],
    client: { connid: examples.uuid[1] },
  },
  { 
    connid: examples.uuid[2],
    deviceid: deviceids[1],
    client: { connid: examples.uuid[2] },
  },
]

let unknownDeviceid = examples.sessionid[2]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    clients.clear()
    deviceidByConnid.clear()
    connidsByDeviceid.clear()
    for ( let { connid, deviceid, client } of conns ) {
      clients.set(connid, client as unknown as WebSocket)
      deviceidByConnid.set(connid, deviceid)
      if ( !connidsByDeviceid.has(deviceid) ) {
        connidsByDeviceid.set(deviceid, new Set())
      }
      connidsByDeviceid.get(deviceid).add(connid)
    }
  })
  test("Function getClientsByDeviceid. Test #1", () => {
    let deviceid = deviceids[0]
    let result = getClientsByDeviceid(deviceid)
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual(conns[0].client)
    expect(result[1]).toStrictEqual(conns[1].client)
  })
  test("Function getClientsByDeviceid. Test #2", () => {
    let deviceid = deviceids[1]
    let result = getClientsByDeviceid(deviceid)
    expect(result).toHaveLength(1)
    expect(result[0]).toStrictEqual(conns[2].client)
  })
  test("Function getClientsByDeviceid. Test #3", () => {
    let deviceid = unknownDeviceid
    let result = getClientsByDeviceid(deviceid)
    expect(result).toHaveLength(0)
  })
  test("Function getConnidsByDeviceid. Test #1", () => {
    let deviceid = deviceids[0]
    let result = getConnidsByDeviceid(deviceid)
    expect(result).toBeDefined()
    expect(result.size).toBe(2)
    expect(result.has(conns[0].connid)).toBe(true)
    expect(result.has(conns[1].connid)).toBe(true)
  })
  test("Function getConnidsByDeviceid. Test #2", () => {
    let deviceid = deviceids[1]
    let result = getConnidsByDeviceid(deviceid)
    expect(result).toBeDefined()
    expect(result.size).toBe(1)
    expect(result.has(conns[2].connid)).toBe(true)
  })
  test("Function getConnidsByDeviceid. Test #3", () => {
    let deviceid = unknownDeviceid
    let result = getConnidsByDeviceid(deviceid)
    expect(result).toBeUndefined()
  })
})

