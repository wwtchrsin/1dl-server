import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: JSON.stringify({
      districtid: { 
        region: "foo",
        district: 1,
      },
      msgcounts: {},
    }),
    calls: {
      update: [{
        districtid: { 
          region: "foo",
          district: 1,
        },
        msgcounts: {},
      }]
    }
  }, {
    tag: 2,
    args: JSON.stringify({
      districtid: { 
        region: "foo",
        district: 1,
      },
    }),
    calls: {
      update: [],
    }
  }, {
    tag: 3,
    args: JSON.stringify({
      msgcounts: {},
    }),
    calls: {
      update: []
    }
  }, {
    tag: 4,
    args: "{{{+++",
    calls: {
      update: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function listeners["msgcounts:zones"]. Test #${tag}`, () => {
      let update = jest.spyOn(serverMessages, "updateZoneMsgcounts")
        .mockImplementation(() => undefined)
      let listener = listeners.get("msgcounts:zones")
      listener(args)
      expect(update).toHaveBeenCalledTimes(calls.update.length)
      for ( let [ index, args ] of calls.update.entries() ) {
        expect(update).toHaveBeenNthCalledWith(index + 1, args)
      }
    })
  }
})