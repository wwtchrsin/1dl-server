import { deleteMessages } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let users = new Map([
  ["/foo/1/2", [{
    userid: "01",
    client: { send: jest.fn(x => undefined) },
  }, {
    userid: "02",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/1", [{
    userid: "03",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo", [{
    userid: "04",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4/3", [{
    userid: "05",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar", [{
    userid: "06",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/5/5", [{
    userid: "07",
    client: { send: jest.fn(x => undefined) },
  }]]
])

let messageids = new Map([
  ["/foo/1/2", [{
    region: "foo",
    district: 1,
    room: 2,
    index: 3,
  }, {
    region: "foo",
    district: 1,
    room: 2,
    index: 4,
  }]], 
  ["/bar/4/3", [{
    region: "bar",
    district: 4,
    room: 3,
    index: 2,
  }]],
  ["/baz/5/5", [{
    region: "baz",
    district: 5,
    room: 5,
    index: 5,
  }]],
])

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wsStorage.clients.clear()
    wsStorage.usersByLocation.clear()
    wsStorage.locationByUser.clear()
    for ( let [location, userlist] of users ) {
      for ( let { userid, client } of userlist ) {
        wsStorage.clients.set(userid, client as unknown as WebSocket)
        wsStorage.locationByUser.set(userid, location)
        if ( !wsStorage.usersByLocation.has(location) ) {
          wsStorage.usersByLocation.set(location, new Set())
        }
        wsStorage.usersByLocation.get(location).add(userid)
      }
    }
  })
  let testcases = [{
    tag: 1,
    args: [messageids.get("/foo/1/2")[0]],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "delete-messages",
          indices: [messageids.get("/foo/1/2")[0].index],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-room-msgcounts",
          msgcounts: { "2": -1 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": -1 },
        })
      ]],
      ["/bar/4/3", []],
      ["/bar", []],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 2,
    args: [
      messageids.get("/foo/1/2")[0],
      messageids.get("/foo/1/2")[1],
    ],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "delete-messages",
          indices: [
            messageids.get("/foo/1/2")[0].index,
            messageids.get("/foo/1/2")[1].index,
          ],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-room-msgcounts",
          msgcounts: { "2": -2 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": -2 },
        })
      ]],
      ["/bar/4/3", []],
      ["/bar", []],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 3,
    args: [messageids.get("/bar/4/3")[0]],
    calls: new Map([
      ["/foo/1/2", []],
      ["/foo/1", []],
      ["/foo", []],
      ["/bar/4/3", [
        JSON.stringify({
          type: "delete-messages",
          indices: [messageids.get("/bar/4/3")[0].index],
        })
      ]],
      ["/bar", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "4": -1 },
        })
      ]],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 4,
    args: [messageids.get("/baz/5/5")[0]],
    calls: new Map([
      ["/foo/1/2", []],
      ["/foo/1", []],
      ["/foo", []],
      ["/bar/4/3", []],
      ["/bar", []],
      ["/foo/5/5", []],
    ])
  }, {
    tag: 5,
    args: [
      messageids.get("/foo/1/2")[0],
      messageids.get("/foo/1/2")[1],
      messageids.get("/bar/4/3")[0],
      messageids.get("/baz/5/5")[0],
    ],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "delete-messages",
          indices: [
            messageids.get("/foo/1/2")[0].index,
            messageids.get("/foo/1/2")[1].index,
          ],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-room-msgcounts",
          msgcounts: { "2": -2 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": -2 },
        })
      ]],
      ["/bar/4/3", [
        JSON.stringify({
          type: "delete-messages",
          indices: [messageids.get("/bar/4/3")[0].index],
        })
      ]],
      ["/bar", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "4": -1 },
        })
      ]],
      ["/foo/5/5", []],
    ]),
  }]
  for ( let testcase of testcases ) {
    let { args, calls, tag } = testcase
    test(`Function insetMessages. Test #${tag}`, () => {
      deleteMessages(args)
      for ( let [location, calllist] of calls ) {
        let clients = users.get(location)
        for ( let { client } of clients ) {
          expect(client.send).toHaveBeenCalledTimes(calllist.length)
          for ( let i=0; i < calllist.length; i++ ) {
            expect(client.send).toHaveBeenNthCalledWith(i+1, calllist[i])
          }
        }
      }
    })
  }
})
