import { listeners } from "../../../lib/ws/subscriptions"
import * as wsState from "../../../lib/ws/state"

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: JSON.stringify({
      userids: ["foo"],
    }),
    calls: {
      deleteClient: ["foo"]
    },
  }, {
    tag: 2,
    args: JSON.stringify({
      userids: ["foo", "bar"],
    }),
    calls: {
      deleteClient: ["foo", "bar"]
    },
  }, {
    tag: 3,
    args: JSON.stringify({
      userid: ["foo"],
    }),
    calls: {
      deleteClient: [],
    },
  }, {
    tag: 4,
    args: "{{{+++",
    calls: {
      deleteClient: [],
    }
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function listeners["messages:created"]. Test #${tag}`, () => {
      let deleteClient = jest.spyOn(wsState, "deleteClient")
        .mockImplementation(() => undefined)
      let listener = listeners.get("sessions:deleted")
      listener(args)
      expect(deleteClient).toHaveBeenCalledTimes(calls.deleteClient.length)
      for ( let [ index, args ] of calls.deleteClient.entries() ) {
        expect(deleteClient).toHaveBeenNthCalledWith(index + 1, args)
      }
    })
  }
})