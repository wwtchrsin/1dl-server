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
      userid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: {
          region: "foo",
        },
      }),
    },
    calls: {
      setUserLocation: [
        [examples.uuid[0], "/foo"]
      ],
      deleteUserLocation: [],
      reportError: [],
    },
  }, {
    tag: 2,
    args: {
      userid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: {
          region: "foo",
          district: 4,
        },
      }),
    },
    calls: {
      setUserLocation: [
        [examples.uuid[0], "/foo/4"]
      ],
      deleteUserLocation: [],
      reportError: [],
    },
  }, {
    tag: 3,
    args: {
      userid: examples.uuid[0],
      message: JSON.stringify({
        type: "set-location",
        location: undefined,
      }),
    },
    calls: {
      setUserLocation: [],
      deleteUserLocation: [
        [examples.uuid[0]]
      ],
      reportError: [
        [examples.uuid[0], "wrongValues.wsMessage.location"]
      ],
    },
  }, {
    tag: 4,
    args: {
      userid: examples.uuid[1],
      message: JSON.stringify({
        type: "abcd",
        location: {
          region: "foo",
          district: 4,
        },
      }),
    },
    calls: {
      setUserLocation: [],
      deleteUserLocation: [],
      reportError: [
        [examples.uuid[1], "wrongValues.wsMessage.type"]
      ],
    },
  }, {
    tag: 5,
    args: {
      userid: examples.uuid[0],
      message: "{{++",
    },
    calls: {
      setUserLocation: [],
      deleteUserLocation: [],
      reportError: [
        [examples.uuid[0], "wrongValues.wsMessage.json"]
      ],
    },
  }]
  for ( let testcase of testcases ) {
    let { tag, args, calls } = testcase
    test(`Function onMessage. Test #${tag}`, () => {
      let setUserLocation = jest.spyOn(wsState, "setUserLocation")
        .mockImplementation(() => undefined)
      let deleteUserLocation = jest.spyOn(wsState, "deleteUserLocation")
        .mockImplementation(() => undefined)
      let reportError = jest.spyOn(serverMessages, "reportError")
        .mockImplementation(() => undefined)
      let { userid, message } = args
      onMessage(userid)(message)
      expect(setUserLocation).toHaveBeenCalledTimes(calls.setUserLocation.length)
      expect(deleteUserLocation).toHaveBeenCalledTimes(calls.deleteUserLocation.length)
      expect(reportError).toHaveBeenCalledTimes(calls.reportError.length)
      for ( let i=0; i < calls.setUserLocation.length; i++ ) {
        let args = calls.setUserLocation[i]
        expect(setUserLocation).toHaveBeenNthCalledWith(i+1, ...args)
      }
      for ( let i=0; i < calls.deleteUserLocation.length; i++ ) {
        let args = calls.deleteUserLocation[i]
        expect(deleteUserLocation).toHaveBeenNthCalledWith(i+1, ...args)
      }
      for ( let i=0; i < calls.reportError.length; i++ ) {
        let args = calls.reportError[i]
        expect(reportError).toHaveBeenNthCalledWith(i+1, ...args)
      }
    })
  }
})