import { updateDistrictMsgcounts } from "../../../lib/ws/server-messages"
import * as wsStorage from "../../../lib/ws/state-storage"
import type { WebSocket } from "ws"

let users = new Map([
  ["/foo/2/2", [{
    userid: "01",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo/2", [{
    userid: "02",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/foo", [{
    userid: "03",
    client: { send: jest.fn(x => undefined) },
  }, {
    userid: "04",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4/4", [{
    userid: "05",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar/4", [{
    userid: "06",
    client: { send: jest.fn(x => undefined) },
  }]],
  ["/bar", [{
    userid: "07",
    client: { send: jest.fn(x => undefined) },
  }]]
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