import { clients, connidsByLocation, locationByConnid } 
  from "../../../lib/ws/state-storage"
import { setConnLocation, deleteConnLocation,
  getConnLocation } from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let conns = [
  { connid: examples.uuid[0], location: locations[0] },
  { connid: examples.uuid[1], location: locations[0] },
  { connid: examples.uuid[2], location: locations[1] }, 
]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    clients.clear()
    connidsByLocation.clear()
    locationByConnid.clear()
    for ( let { connid, location } of conns ) {
      clients.set(connid, {} as WebSocket)
      locationByConnid.set(connid, location)
      if ( !connidsByLocation.has(location) ) {
        connidsByLocation.set(location, new Set())
      }
      connidsByLocation.get(location).add(connid)
    }
  })
  test("Function setConnLocation. Test #1", () => {
    let connid = conns[0].connid
    let location = conns[0].location
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = setConnLocation(connid, location)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(conns[0].location)
    expect(connLocation).toBe(location)
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[0].has(connid)).toBe(true)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function setConnLocation. Test #2", () => {
    let connid = conns[0].connid
    let location = locations[1]
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = setConnLocation(connid, location)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(conns[0].location)
    expect(connLocation).toBe(location)
    expect(connLists[0].size).toBe(initialSize[0] - 1)
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1] + 1)
    expect(connLists[1].has(connid)).toBe(true)
  })
  test("Function setConnLocation. Test #3", () => {
    let connid = examples.uuid[3]
    let location = conns[0].location
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = setConnLocation(connid, location)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(undefined)
    expect(connLocation).toBe(undefined)
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function setConnLocation. Test #4", () => {
    let connid = examples.uuid[3]
    let location = conns[0].location
    clients.set(connid, {} as WebSocket)
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = setConnLocation(connid, location)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(undefined)
    expect(connLocation).toBe(location)
    expect(connLists[0].size).toBe(initialSize[0] + 1)
    expect(connLists[0].has(connid)).toBe(true)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function setConnLocation. Test #5", () => {
    let connid = examples.uuid[3]
    let location = "/baz"
    clients.set(connid, {} as WebSocket)
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size,
    ]
    let result = setConnLocation(connid, location)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1]),
      connidsByLocation.get(location),
    ]
    expect(result).toBe(undefined)
    expect(connLocation).toBe(location)
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
    expect(connLists[2].size).toBe(1)
    expect(connLists[2].has(connid)).toBe(true)
  })
  test("Function deleteConnLocation. Test #1", () => {
    let connid = conns[0].connid
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = deleteConnLocation(connid)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(conns[0].location)
    expect(connLocation).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0] - 1)
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function deleteConnLocation. Test #2", () => {
    let connid = conns[2].connid
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = deleteConnLocation(connid)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBe(conns[2].location)
    expect(connLocation).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1] - 1)
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function deleteConnLocation. Test #3", () => {
    let connid = examples.uuid[3]
    let initialSize = [
      connidsByLocation.get(locations[0]).size,
      connidsByLocation.get(locations[1]).size
    ]
    let result = deleteConnLocation(connid)
    let connLocation = locationByConnid.get(connid)
    let connLists = [
      connidsByLocation.get(locations[0]),
      connidsByLocation.get(locations[1])
    ]
    expect(result).toBeUndefined()
    expect(connLocation).toBeUndefined()
    expect(connLists[0].size).toBe(initialSize[0])
    expect(connLists[0].has(connid)).toBe(false)
    expect(connLists[1].size).toBe(initialSize[1])
    expect(connLists[1].has(connid)).toBe(false)
  })
  test("Function getConnLocation. Test #1", () => {
    let connid = conns[0].connid
    let result = getConnLocation(connid)
    expect(result).toBe(conns[0].location)
  })
  test("Function getConnLocation. Test #2", () => {
    let connid = examples.uuid[3]
    let result = getConnLocation(connid)
    expect(result).toBeUndefined()
  })
})