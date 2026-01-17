import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: JSON.stringify({
      messages: [],
    }),
    calls: {
      insertMessages: [[]]
    }
  }, {
    tag: 2,
    args: JSON.stringify({
      message: [],
    }),
    calls: {
      insertMessages: [],
    }
  }, {
    tag: 3,
    args: "{{{+++",
    calls: {
      insertMessages: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function listeners["messages:created"]. Test #${tag}`, () => {
      let insertMessages = jest.spyOn(serverMessages, "insertMessages")
        .mockImplementation(() => undefined)
      let listener = listeners.get("messages:created")
      listener(args)
      expect(insertMessages).toHaveBeenCalledTimes(calls.insertMessages.length)
      for ( let [ index, args ] of calls.insertMessages.entries() ) {
        expect(insertMessages).toHaveBeenNthCalledWith(index + 1, args)
      }
    })
  }
})