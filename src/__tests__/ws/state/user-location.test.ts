import { clients, usersByLocation, locationByUser } 
  from "../../../lib/ws/state-storage"
import { setUserLocation, deleteUserLocation,
  getUserLocation } from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"
import type { WebSocket } from "ws"

let locations = [ "/foo", "/bar" ]

let users = [
  { userid: examples.uuid[0], location: locations[0] },
  { userid: examples.uuid[1], location: locations[0] },
  { userid: examples.uuid[2], location: locations[1] }, 
]

describe("testing ws state handlers...", () => {
  beforeEach(() => {
    clients.clear()
    usersByLocation.clear()
    locationByUser.clear()
    for ( let { userid, location } of users ) {
      clients.set(userid, {} as WebSocket)
      locationByUser.set(userid, location)
      if ( !usersByLocation.has(location) ) {
        usersByLocation.set(location, new Set())
      }
      usersByLocation.get(location).add(userid)
    }
  })
  test("Function setUserLocation. Test #1", () => {
    let userid = users[0].userid
    let location = users[0].location
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = setUserLocation(userid, location)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(users[0].location)
    expect(userLocation).toBe(location)
    expect(userLists[0].size).toBe(initialSize[0])
    expect(userLists[0].has(userid)).toBe(true)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function setUserLocation. Test #2", () => {
    let userid = users[0].userid
    let location = locations[1]
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = setUserLocation(userid, location)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(users[0].location)
    expect(userLocation).toBe(location)
    expect(userLists[0].size).toBe(initialSize[0] - 1)
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1] + 1)
    expect(userLists[1].has(userid)).toBe(true)
  })
  test("Function setUserLocation. Test #3", () => {
    let userid = examples.uuid[3]
    let location = users[0].location
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = setUserLocation(userid, location)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(undefined)
    expect(userLocation).toBe(undefined)
    expect(userLists[0].size).toBe(initialSize[0])
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function setUserLocation. Test #4", () => {
    let userid = examples.uuid[3]
    let location = users[0].location
    clients.set(userid, {} as WebSocket)
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = setUserLocation(userid, location)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(undefined)
    expect(userLocation).toBe(location)
    expect(userLists[0].size).toBe(initialSize[0] + 1)
    expect(userLists[0].has(userid)).toBe(true)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function setUserLocation. Test #5", () => {
    let userid = examples.uuid[3]
    let location = "/baz"
    clients.set(userid, {} as WebSocket)
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size,
    ]
    let result = setUserLocation(userid, location)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1]),
      usersByLocation.get(location),
    ]
    expect(result).toBe(undefined)
    expect(userLocation).toBe(location)
    expect(userLists[0].size).toBe(initialSize[0])
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
    expect(userLists[2].size).toBe(1)
    expect(userLists[2].has(userid)).toBe(true)
  })
  test("Function deleteUserLocation. Test #1", () => {
    let userid = users[0].userid
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = deleteUserLocation(userid)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(users[0].location)
    expect(userLocation).toBeUndefined()
    expect(userLists[0].size).toBe(initialSize[0] - 1)
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function deleteUserLocation. Test #2", () => {
    let userid = users[2].userid
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = deleteUserLocation(userid)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBe(users[2].location)
    expect(userLocation).toBeUndefined()
    expect(userLists[0].size).toBe(initialSize[0])
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1] - 1)
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function deleteUserLocation. Test #3", () => {
    let userid = examples.uuid[3]
    let initialSize = [
      usersByLocation.get(locations[0]).size,
      usersByLocation.get(locations[1]).size
    ]
    let result = deleteUserLocation(userid)
    let userLocation = locationByUser.get(userid)
    let userLists = [
      usersByLocation.get(locations[0]),
      usersByLocation.get(locations[1])
    ]
    expect(result).toBeUndefined()
    expect(userLocation).toBeUndefined()
    expect(userLists[0].size).toBe(initialSize[0])
    expect(userLists[0].has(userid)).toBe(false)
    expect(userLists[1].size).toBe(initialSize[1])
    expect(userLists[1].has(userid)).toBe(false)
  })
  test("Function getUserLocation. Test #1", () => {
    let userid = users[0].userid
    let result = getUserLocation(userid)
    expect(result).toBe(users[0].location)
  })
  test("Function getUserLocation. Test #2", () => {
    let userid = examples.uuid[3]
    let result = getUserLocation(userid)
    expect(result).toBeUndefined()
  })
})