import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: JSON.stringify({
      messageids: [],
    }),
    calls: {
      deleteMessages: [[]]
    }
  }, {
    tag: 2,
    args: JSON.stringify({
      messages: [],
    }),
    calls: {
      deleteMessages: [],
    }
  }, {
    tag: 3,
    args: "{{{+++",
    calls: {
      deleteMessages: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function listeners["messages:deleted"]. Test #${tag}`, () => {
      let deleteMessages = jest.spyOn(serverMessages, "deleteMessages")
        .mockImplementation(() => undefined)
      let listener = listeners.get("messages:deleted")
      listener(args)
      expect(deleteMessages).toHaveBeenCalledTimes(calls.deleteMessages.length)
      for ( let [ index, args ] of calls.deleteMessages.entries() ) {
        expect(deleteMessages).toHaveBeenNthCalledWith(index + 1, args)
      }
    })
  }
})