import { onMessage } from "../../../lib/ws/client-messages"
import * as serverMessages from "../../../lib/ws/server-messages"
import * as wsState from "../../../lib/ws/state"
import { examples } from "../../../lib/test-data"

describe("testing ws message handlers...", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      connid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: {
          region: "foo",
        },
      }),
    },
    calls: {
      setConnLocation: [
        [examples.uuid[0], "/foo"]
      ],
      deleteConnLocation: [],
      reportError: [],
    },
  }, {
    tag: 2,
    args: {
      connid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: {
          region: "foo",
          district: 4,
        },
      }),
    },
    calls: {
      setConnLocation: [
        [examples.uuid[0], "/foo/4"]
      ],
      deleteConnLocation: [],
      reportError: [],
    },
  }, {
    tag: 3,
    args: {
      connid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: undefined,
      }),
    },
    calls: {
      setConnLocation: [],
      deleteConnLocation: [
        [examples.uuid[0]]
      ],
      reportError: [
        [examples.uuid[0], "wsError.wrongLocation"]
      ],
    },
  }, {
    tag: 4,
    args: {
      connid: examples.uuid[1],
      message: JSON.stringify({
        type: "abcd",
        location: {
          region: "foo",
          district: 4,
        },
      }),
    },
    calls: {
      setConnLocation: [],
      deleteConnLocation: [],
      reportError: [
        [examples.uuid[1], "wsError.wrongMessageType"]
      ],
    },
  }, {
    tag: 5,
    args: {
      connid: examples.uuid[0],
      message: "{{++",
    },
    calls: {
      setConnLocation: [],
      deleteConnLocation: [],
      reportError: [
        [examples.uuid[0], "wsError.wrongJson"]
      ],
    },
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function onMessage. Test #${tag}`, () => {
      let setConnLocation = jest.spyOn(wsState, "setConnLocation")
        .mockImplementation(() => undefined)
      let deleteConnLocation = jest.spyOn(wsState, "deleteConnLocation")
        .mockImplementation(() => undefined)
      let reportError = jest.spyOn(serverMessages, "reportError")
        .mockImplementation(() => undefined)
      let { connid, message } = args
      onMessage(connid)(message)
      expect(setConnLocation).toHaveBeenCalledTimes(calls.setConnLocation.length)
      expect(deleteConnLocation).toHaveBeenCalledTimes(calls.deleteConnLocation.length)
      expect(reportError).toHaveBeenCalledTimes(calls.reportError.length)
      for ( let i=0; i < calls.setConnLocation.length; i++ ) {
        let args = calls.setConnLocation[i]
        expect(setConnLocation).toHaveBeenNthCalledWith(i+1, ...args)
      }
      for ( let i=0; i < calls.deleteConnLocation.length; i++ ) {
        let args = calls.deleteConnLocation[i]
        expect(deleteConnLocation).toHaveBeenNthCalledWith(i+1, ...args)
      }
      for ( let i=0; i < calls.reportError.length; i++ ) {
        let args = calls.reportError[i]
        expect(reportError).toHaveBeenNthCalledWith(i+1, ...args)
      }
    })
  }
})