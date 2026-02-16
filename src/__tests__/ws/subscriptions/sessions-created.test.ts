import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"
import { examples } from "../../../lib/test-data"

let onSessionCreated = listeners.get("sessions:created")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('Function listeners["sessions:created"]. Test #1', async () => {
    let deviceids = [ examples.sessionid[0] ]
    let messageJSON = JSON.stringify({ deviceids })
    let report = jest.spyOn(serverMessages, "reportLogin")
    report.mockImplementation(() => undefined)
    onSessionCreated(messageJSON)
    expect(report).toHaveBeenCalledTimes(1)
    expect(report).toHaveBeenNthCalledWith(1, deviceids)
  })
  test('Function listeners["sessions:created"]. Test #2', async () => {
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    let messageJSON = JSON.stringify({ deviceids })
    let report = jest.spyOn(serverMessages, "reportLogin")
    report.mockImplementation(() => undefined)
    onSessionCreated(messageJSON)
    expect(report).toHaveBeenCalledTimes(1)
    expect(report).toHaveBeenNthCalledWith(1, deviceids)
  })
  test('Function listeners["sessions:created"]. Test #3', async () => {
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    let messageJSON = JSON.stringify({ deviceid: deviceids })
    let report = jest.spyOn(serverMessages, "reportLogin")
    report.mockImplementation(() => undefined)
    onSessionCreated(messageJSON)
    expect(report).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["sessions:created"]. Test #4', async () => {
    let report = jest.spyOn(serverMessages, "reportLogin")
    report.mockImplementation(() => undefined)
    onSessionCreated("[[]]]{{+-")
    expect(report).toHaveBeenCalledTimes(0)
  })
})