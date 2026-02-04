import { clients, connidsByLocation, locationByConnid } 
  from "../../../lib/ws/state-storage"
import { getClientsByLocation, getConnidsByLocation } from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let conns = [
  { 
    connid: examples.uuid[0],
    location: locations[0],
    client: { connid: examples.uuid[0] }
  }, { 
    connid: examples.uuid[1],
    location: locations[0],
    client: { connid: examples.uuid[1] }
  }, {
    connid: examples.uuid[2],
    location: locations[1],
    client: { connid: examples.uuid[2] }
  },
]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
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
    }
  })
  test("Function getClientsByLocation. Test #1", () => {
    let location = locations[0]
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual(conns[0].client)
    expect(result[1]).toStrictEqual(conns[1].client)
  })
  test("Function getClientsByLocation. Test #2", () => {
    let location = locations[1]
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(1)
    expect(result[0]).toStrictEqual(conns[2].client)
  })
  test("Function getClientsByLocation. Test #2", () => {
    let location = "/baz"
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(0)
  })
  test("Function getConnidsByLocation. Test #1", () => {
    let location = "/foo"
    let result = getConnidsByLocation(location)
    expect(result.size).toBe(2)
    expect(result.has(conns[0].connid)).toBe(true)
    expect(result.has(conns[1].connid)).toBe(true)
  })
  test("Function getConnidsByLocation. Test #1", () => {
    let location = "/bar"
    let result = getConnidsByLocation(location)
    expect(result.size).toBe(1)
    expect(result.has(conns[2].connid)).toBe(true)
  })
})