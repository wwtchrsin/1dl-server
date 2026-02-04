import { insertMessages } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let conns = new Map([
  ["/foo/1/2", [{
    connid: "01",
    client: { send: jest.fn(x => undefined) },
  }, {
    connid: "02",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/1", [{
    connid: "03",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo", [{
    connid: "04",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4/3", [{
    connid: "05",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar", [{
    connid: "06",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/5/5", [{
    connid: "07",
    client: { send: jest.fn(x => undefined) },
  }]]
])

let messages = new Map([
  ["/foo/1/2", [{
    region: "foo",
    district: 1,
    zone: 2,
    index: 3,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }, {
    region: "foo",
    district: 1,
    zone: 2,
    index: 4,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }]], 
  ["/bar/4/3", [{
    region: "bar",
    district: 4,
    zone: 3,
    index: 2,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }]],
  ["/baz/5/5", [{
    region: "baz",
    district: 5,
    zone: 5,
    index: 5,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }]],
])

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    wsStorage.clients.clear()
    wsStorage.connidsByLocation.clear()
    wsStorage.locationByConnid.clear()
    for ( let [location, userlist] of conns ) {
      for ( let { connid, client } of userlist ) {
        wsStorage.clients.set(connid, client as unknown as WebSocket)
        wsStorage.locationByConnid.set(connid, location)
        if ( !wsStorage.connidsByLocation.has(location) ) {
          wsStorage.connidsByLocation.set(location, new Set())
        }
        wsStorage.connidsByLocation.get(location).add(connid)
      }
    }
  })
  let testcases = [{
    tag: 1,
    args: [messages.get("/foo/1/2")[0]],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/foo/1/2")[0]],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-zone-msgcounts",
          msgcounts: { "2": 1 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": 1 },
        })
      ]],
      ["/bar/4/3", []],
      ["/bar", []],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 2,
    args: [
      messages.get("/foo/1/2")[0],
      messages.get("/foo/1/2")[1],
    ],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "insert-messages",
          messages: [
            messages.get("/foo/1/2")[0],
            messages.get("/foo/1/2")[1],
          ],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-zone-msgcounts",
          msgcounts: { "2": 2 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": 2 },
        })
      ]],
      ["/bar/4/3", []],
      ["/bar", []],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 3,
    args: [messages.get("/bar/4/3")[0]],
    calls: new Map([
      ["/foo/1/2", []],
      ["/foo/1", []],
      ["/foo", []],
      ["/bar/4/3", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/bar/4/3")[0]],
        })
      ]],
      ["/bar", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "4": 1 },
        })
      ]],
      ["/foo/5/5", []],
    ]),
  }, {
    tag: 4,
    args: [messages.get("/baz/5/5")[0]],
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
      messages.get("/foo/1/2")[0],
      messages.get("/foo/1/2")[1],
      messages.get("/bar/4/3")[0],
      messages.get("/baz/5/5")[0],
    ],
    calls: new Map([
      ["/foo/1/2", [
        JSON.stringify({
          type: "insert-messages",
          messages: [
            messages.get("/foo/1/2")[0],
            messages.get("/foo/1/2")[1],
          ],
        })
      ]],
      ["/foo/1", [
        JSON.stringify({
          type: "change-zone-msgcounts",
          msgcounts: { "2": 2 },
        })
      ]],
      ["/foo", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "1": 2 },
        })
      ]],
      ["/bar/4/3", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/bar/4/3")[0]],
        })
      ]],
      ["/bar", [
        JSON.stringify({
          type: "change-district-msgcounts",
          msgcounts: { "4": 1 },
        })
      ]],
      ["/foo/5/5", []],
    ]),
  }]
  for ( let testcase of testcases ) {
    let { args, calls, tag } = testcase
    test(`Function insetMessages. Test #${tag}`, () => {
      insertMessages(args)
      for ( let [location, calllist] of calls ) {
        let clients = conns.get(location)
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
