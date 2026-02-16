import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"

let onMsgcountUpdate = listeners.get("msgcounts:zones")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('Function listeners["msgcounts:zones"]. Test #1', () => {
    let report = {
      districtid: {
        region: "foo",
        district: 1,
      },
      msgcounts: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateZoneMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(1)
    expect(updateMsgcounts).toHaveBeenNthCalledWith(1, report)
  })
  test('Function listeners["msgcounts:zones"]. Test #2', () => {
    let report = {
      districtid: {
        region: "bar",
        district: 2,
      },
      msgcounts: { "1": 1, "2": 3 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateZoneMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(1)
    expect(updateMsgcounts).toHaveBeenNthCalledWith(1, report)
  })
  test('Function listeners["msgcounts:zones"]. Test #3', () => {
    let report = {
      districtid: {
        region: "foo",
        district: 1,
      },
      msgcount: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateZoneMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["msgcounts:zones"]. Test #4', () => {
    let report = {
      districtids: {
        region: "foo",
        district: 1,
      },
      msgcounts: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateZoneMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["msgcounts:zones"]. Test #5', () => {
    let updateMsgcounts = jest.spyOn(serverMessages, "updateZoneMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate("++}{++")
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
})

