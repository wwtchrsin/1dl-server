import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"
import { databaseMessages } from "../../../lib/test-data"

let onMessagesDeleted = listeners.get("messages:deleted")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test(`Function listeners["messages:deleted"]. Test #1` , () => {
    let messageids = [ databaseMessages[0] ]
    let messageidsJSON = JSON.stringify({ messageids })
    let deleteMessages = jest.spyOn(serverMessages, "deleteMessages")
    deleteMessages.mockImplementation(() => undefined)
    onMessagesDeleted(messageidsJSON)
    expect(deleteMessages).toHaveBeenCalledTimes(1)
    expect(deleteMessages).toHaveBeenNthCalledWith(1, messageids)
  })
  test(`Function listeners["messages:deleted"]. Test #2` , () => {
    let messageids = [ 
      databaseMessages[1],
      databaseMessages[3],
      databaseMessages[5],
    ]
    let messageidsJSON = JSON.stringify({ messageids })
    let deleteMessages = jest.spyOn(serverMessages, "deleteMessages")
    deleteMessages.mockImplementation(() => undefined)
    onMessagesDeleted(messageidsJSON)
    expect(deleteMessages).toHaveBeenCalledTimes(1)
    expect(deleteMessages).toHaveBeenNthCalledWith(1, messageids)
  })
  test(`Function listeners["messages:deleted"]. Test #3` , () => {
    let messageids = [ databaseMessages[0] ]
    let messageidsJSON = JSON.stringify({ messageid: messageids })
    let deleteMessages = jest.spyOn(serverMessages, "deleteMessages")
    deleteMessages.mockImplementation(() => undefined)
    onMessagesDeleted(messageidsJSON)
    expect(deleteMessages).toHaveBeenCalledTimes(0)
  })
  test(`Function listeners["messages:deleted"]. Test #4` , () => {
    let deleteMessages = jest.spyOn(serverMessages, "deleteMessages")
    deleteMessages.mockImplementation(() => undefined)
    onMessagesDeleted("][}{")
    expect(deleteMessages).toHaveBeenCalledTimes(0)
  })
})