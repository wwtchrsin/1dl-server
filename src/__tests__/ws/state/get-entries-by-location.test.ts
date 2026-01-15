import { clients, usersByLocation, locationByUser } 
  from "../../../lib/ws/state-storage"
import { getClientsByLocation, getUsersByLocation } from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let users = [
  { 
    userid: examples.uuid[0],
    location: locations[0],
    client: { userid: examples.uuid[0] }
  }, { 
    userid: examples.uuid[1],
    location: locations[0],
    client: { userid: examples.uuid[1] }
  }, {
    userid: examples.uuid[2],
    location: locations[1],
    client: { userid: examples.uuid[2] }
  },
]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
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
  test("Function getClientsByLocation. Test #1", () => {
    let location = locations[0]
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(2)
    expect(result[0]).toStrictEqual(users[0].client)
    expect(result[1]).toStrictEqual(users[1].client)
  })
  test("Function getClientsByLocation. Test #2", () => {
    let location = locations[1]
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(1)
    expect(result[0]).toStrictEqual(users[2].client)
  })
  test("Function getClientsByLocation. Test #2", () => {
    let location = "/baz"
    let result = getClientsByLocation(location)
    expect(result).toHaveLength(0)
  })
  test("Function getUsersByLocation. Test #1", () => {
    let location = "/foo"
    let result = getUsersByLocation(location)
    expect(result.size).toBe(2)
    expect(result.has(users[0].userid)).toBe(true)
    expect(result.has(users[1].userid)).toBe(true)
  })
  test("Function getUsersByLocation. Test #1", () => {
    let location = "/bar"
    let result = getUsersByLocation(location)
    expect(result.size).toBe(1)
    expect(result.has(users[2].userid)).toBe(true)
  })
})