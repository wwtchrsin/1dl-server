import { insertMessages } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let conns = new Map([
  ["/foo/bar", [{
    connid: "01",
    client: { send: jest.fn(x => undefined) },
  }, {
    connid: "02",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/foo", [{
    connid: "03",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/baz/bar", [{
    connid: "04",
    client: { send: jest.fn(x => undefined) },
  }]]
])

let messages = new Map([
  ["/foo/bar", [{
    region: "foo",
    tag: "bar",
    index: 3,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }, {
    region: "foo",
    tag: "bar",
    index: 4,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }]], 
  ["/bar/foo", [{
    region: "bar",
    tag: "foo",
    index: 2,
    text: "text",
    color: "color",
    puid: "puid",
    username: "name",
    timestamp: "1234567890",
  }]],
  ["/baz/baz", [{
    region: "baz",
    tag: "baz",
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
    args: [messages.get("/foo/bar")[0]],
    calls: new Map([
      ["/foo/bar", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/foo/bar")[0]],
        })
      ]],
      ["/bar/foo", []],
      ["/baz/bar", []],
    ]),
  }, {
    tag: 2,
    args: [
      messages.get("/foo/bar")[0],
      messages.get("/foo/bar")[1],
    ],
    calls: new Map([
      ["/foo/bar", [
        JSON.stringify({
          type: "insert-messages",
          messages: [
            messages.get("/foo/bar")[0],
            messages.get("/foo/bar")[1],
          ],
        })
      ]],
      ["/bar/foo", []],
      ["/baz/bar", []],
    ]),
  }, {
    tag: 3,
    args: [messages.get("/bar/foo")[0]],
    calls: new Map([
      ["/foo/bar", []],
      ["/bar/foo", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/bar/foo")[0]],
        })
      ]],
      ["/baz/bar", []],
    ]),
  }, {
    tag: 4,
    args: [messages.get("/baz/baz")[0]],
    calls: new Map([
      ["/foo/bar", []],
      ["/bar/foo", []],
      ["/baz/bar", []],
    ])
  }, {
    tag: 5,
    args: [
      messages.get("/foo/bar")[0],
      messages.get("/foo/bar")[1],
      messages.get("/bar/foo")[0],
      messages.get("/baz/baz")[0],
    ],
    calls: new Map([
      ["/foo/bar", [
        JSON.stringify({
          type: "insert-messages",
          messages: [
            messages.get("/foo/bar")[0],
            messages.get("/foo/bar")[1],
          ],
        })
      ]],
      ["/bar/foo", [
        JSON.stringify({
          type: "insert-messages",
          messages: [messages.get("/bar/foo")[0]],
        })
      ]],
      ["/baz/bar", []],
    ]),
  }]
  for ( let testcase of testcases ) {
    let { args, calls, tag } = testcase
    test(`Function insertMessages. Test #${tag}`, () => {
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
