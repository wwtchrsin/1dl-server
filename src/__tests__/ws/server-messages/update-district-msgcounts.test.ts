import { updateDistrictMsgcounts } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let conns = new Map([
  ["/foo/2/2", [{
    connid: "01",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/2", [{
    connid: "02",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo", [{
    connid: "03",
    client: { send: jest.fn(x => undefined) },
  }, {
    connid: "04",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4/4", [{
    connid: "05",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4", [{
    connid: "06",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar", [{
    connid: "07",
    client: { send: jest.fn(x => undefined) },
  }]]
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
    args: {
      region: "foo",
      msgcounts: {
        "2": 4,
        "3": 7,
      },
    },
    calls: new Map([
      ["/foo/2/2", []],
      ["/foo/2", []],
      ["/foo", [
        JSON.stringify({
          type: "update-district-msgcounts",
          msgcounts: {
            "2": 4,
            "3": 7,
          },
        })
      ]],
      ["/bar/4/4", []],
      ["/bar/4", []],
      ["/bar", []],
    ]),
  }, {
    tag: 2,
    args: {
      region: "bar",
      msgcounts: {
        "3": 5,
        "7": 11,
        "13": 17,
      },
    },
    calls: new Map([
      ["/foo/2/2", []],
      ["/foo/2", []],
      ["/foo", []],
      ["/bar/4/4", []],
      ["/bar/4", []],
      ["/bar", [
        JSON.stringify({
          type: "update-district-msgcounts",
          msgcounts: {
            "3": 5,
            "7": 11,
            "13": 17,
          },
        })
      ]],
    ]),
  }, {
    tag: 3,
    args: {
      region: "baz",
      msgcounts: {
        "3": 5,
        "7": 11,
        "13": 17,
      },
    },
    calls: new Map([
      ["/foo/2/2", []],
      ["/foo/2", []],
      ["/foo", []],
      ["/bar/4/4", []],
      ["/bar/4", []],
      ["/bar", []],
    ]),
  }]
  for ( let testcase of testcases ) {
    let { args, calls, tag } = testcase
    test(`Function updateDistrictMsgcounts. Test #${tag}`, () => {
      updateDistrictMsgcounts(args)
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