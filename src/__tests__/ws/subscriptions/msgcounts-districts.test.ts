import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"

let onMsgcountUpdate = listeners.get("msgcounts:districts")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test('Function listeners["msgcounts:districts"]. Test #1', () => {
    let report = {
      region: "foo",
      msgcounts: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateDistrictMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(1)
    expect(updateMsgcounts).toHaveBeenNthCalledWith(1, report)
  })
  test('Function listeners["msgcounts:districts"]. Test #2', () => {
    let report = {
      region: "bar",
      msgcounts: { "1": 1, "2": 3 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateDistrictMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(1)
    expect(updateMsgcounts).toHaveBeenNthCalledWith(1, report)
  })
  test('Function listeners["msgcounts:districts"]. Test #3', () => {
    let report = {
      region: "bar",
      msgcount: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateDistrictMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["msgcounts:districts"]. Test #4', () => {
    let report = {
      regions: "bar",
      msgcounts: { "1": 1 }
    }
    let reportJSON = JSON.stringify(report)
    let updateMsgcounts = jest.spyOn(serverMessages, "updateDistrictMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate(reportJSON)
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
  test('Function listeners["msgcounts:districts"]. Test #5', () => {
    let updateMsgcounts = jest.spyOn(serverMessages, "updateDistrictMsgcounts")
    updateMsgcounts.mockImplementation(() => undefined)
    onMsgcountUpdate("++}{++")
    expect(updateMsgcounts).toHaveBeenCalledTimes(0)
  })
})

