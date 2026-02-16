import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"
import { examples } from "../../../lib/test-data"

let onSessionDeleted = listeners.get("sessions:deleted")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('Function listeners["sessions:deleted"]. Test #1', async () => {
    let deviceids = [ examples.sessionid[0] ]
    let messageJSON = JSON.stringify({ deviceids })
    let report = jest.spyOn(serverMessages, "reportLogout")
    report.mockImplementation(() => undefined)
    onSessionDeleted(messageJSON)
    expect(report).toHaveBeenCalledTimes(1)
    expect(report).toHaveBeenNthCalledWith(1, deviceids)
  })
  test('Function listeners["sessions:deleted"]. Test #2', async () => {
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    let messageJSON = JSON.stringify({ deviceids })
    let report = jest.spyOn(serverMessages, "reportLogout")
    report.mockImplementation(() => undefined)
    onSessionDeleted(messageJSON)
    expect(report).toHaveBeenCalledTimes(1)
    expect(report).toHaveBeenNthCalledWith(1, deviceids)
  })
  test('Function listeners["sessions:deleted"]. Test #3', async () => {
    let deviceids = [
      examples.sessionid[0],
      examples.sessionid[1],
    ]
    let messageJSON = JSON.stringify({ deviceid: deviceids })
    let report = jest.spyOn(serverMessages, "reportLogout")
    report.mockImplementation(() => undefined)
    onSessionDeleted(messageJSON)
    expect(report).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["sessions:deleted"]. Test #4', async () => {
    let report = jest.spyOn(serverMessages, "reportLogout")
    report.mockImplementation(() => undefined)
    onSessionDeleted("{{{+++")
    expect(report).toHaveBeenCalledTimes(0)
  })
})