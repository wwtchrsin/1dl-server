import { clients, deviceidByConnid, connidsByDeviceid } 
  from "../../../lib/ws/state-storage"
import { setConnDeviceid, getConnDeviceid, deleteConnDeviceid }
  from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let deviceids = [
  examples.sessionid[0],
  examples.sessionid[1],
]

let conns = [
  { connid: examples.uuid[0], deviceid: deviceids[0] },
  { connid: examples.uuid[1], deviceid: deviceids[0] },
  { connid: examples.uuid[2], deviceid: deviceids[1] },
]

let freeConnid = examples.uuid[3]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    clients.clear()
    deviceidByConnid.clear()
    connidsByDeviceid.clear()
    for ( let { connid, deviceid } of conns ) {
      clients.set(connid, {} as WebSocket)
      deviceidByConnid.set(connid, deviceid)
      if ( !connidsByDeviceid.has(deviceid) ) {
        connidsByDeviceid.set(deviceid, new Set())
      }
      connidsByDeviceid.get(deviceid).add(connid)
    }
  })
  test("Function setConnDeviceid. Test #1", () => {
    let connid = conns[0].connid
    let deviceid = conns[0].deviceid
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    let result = setConnDeviceid(connid, deviceid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBe(conns[0].deviceid)
    expect(connDeviceid).toBe(deviceid)
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[0].has(connid)).toBe(true)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function setConnDeviceid. Test #2", () => {
    let connid = freeConnid
    let deviceid = deviceids[0]
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    clients.set(connid, {} as WebSocket)
    let result = setConnDeviceid(connid, deviceid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBeUndefined()
    expect(connDeviceid).toBe(deviceid)
    expect(connLists[0].size).toBe(initialSize[0] + 1)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[0].has(connid)).toBe(true)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function setConnDeviceid. Test #3", () => {
    let connid = freeConnid
    let deviceid = deviceids[1]
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    clients.set(connid, {} as WebSocket)
    let result = setConnDeviceid(connid, deviceid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBeUndefined()
    expect(connDeviceid).toBe(deviceid)
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[1].size).toBe(initialSize[1] + 1)
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].has(connid)).toBe(true)
  })
  test("Function setConnDeviceid. Test #4", () => {
    let connid = freeConnid
    let deviceid = deviceids[0]
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    let result = setConnDeviceid(connid, deviceid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBeUndefined()
    expect(connDeviceid).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function deleteConnDeviceid. Test #1", () => {
    let connid = conns[0].connid
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    let result = deleteConnDeviceid(connid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBe(conns[0].deviceid)
    expect(connDeviceid).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0] - 1)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function deleteConnDeviceid. Test #2", () => {
    let connid = conns[2].connid
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    let result = deleteConnDeviceid(connid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBe(conns[2].deviceid)
    expect(connDeviceid).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[1].size).toBe(initialSize[1] - 1)
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function deleteConnDeviceid. Test #3", () => {
    let connid = freeConnid
    let initialSize = [
      connidsByDeviceid.get(deviceids[0]).size,
      connidsByDeviceid.get(deviceids[1]).size,
    ]
    let result = deleteConnDeviceid(connid)
    let connDeviceid = deviceidByConnid.get(connid)
    let connLists = [
      connidsByDeviceid.get(deviceids[0]),
      connidsByDeviceid.get(deviceids[1]),
    ]
    expect(result).toBeUndefined()
    expect(connDeviceid).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function getConnDeviceid. Test #1", () => {
    let result = getConnDeviceid(conns[0].connid)
    expect(result).toBe(conns[0].deviceid)
  })
  test("Function getConnDeviceid. Test #2", () => {
    let result = getConnDeviceid(freeConnid)
    expect(result).toBeUndefined()
  })
})
