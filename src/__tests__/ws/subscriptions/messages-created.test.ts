import { listeners } from "../../../lib/ws/subscriptions"
import * as serverMessages from "../../../lib/ws/server-messages"
import { databaseMessages } from "../../../lib/test-data"

let onMessagesCreated = listeners.get("messages:created")!

describe("testing ws subscriptions...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test(`Function listeners["messages:created"]. Test #1` , () => {
    let messages = [ databaseMessages[0] ]
    let messagesJSON = JSON.stringify({ messages })
    let insertMessages = jest.spyOn(serverMessages, "insertMessages")
    insertMessages.mockImplementation(() => undefined)
    onMessagesCreated(messagesJSON)
    expect(insertMessages).toHaveBeenCalledTimes(1)
    expect(insertMessages).toHaveBeenNthCalledWith(1, messages)
  })
  test(`Function listeners["messages:created"]. Test #2` , () => {
    let messages = [ 
      databaseMessages[1],
      databaseMessages[3],
      databaseMessages[5],
    ]
    let messagesJSON = JSON.stringify({ messages })
    let insertMessages = jest.spyOn(serverMessages, "insertMessages")
    insertMessages.mockImplementation(() => undefined)
    onMessagesCreated(messagesJSON)
    expect(insertMessages).toHaveBeenCalledTimes(1)
    expect(insertMessages).toHaveBeenNthCalledWith(1, messages)
  })
  test(`Function listeners["messages:created"]. Test #3` , () => {
    let messages = [ databaseMessages[0] ]
    let messagesJSON = JSON.stringify({ message: messages })
    let insertMessages = jest.spyOn(serverMessages, "insertMessages")
    insertMessages.mockImplementation(() => undefined)
    onMessagesCreated(messagesJSON)
    expect(insertMessages).toHaveBeenCalledTimes(0)
  })
  test(`Function listeners["messages:created"]. Test #4` , () => {
    let insertMessages = jest.spyOn(serverMessages, "insertMessages")
    insertMessages.mockImplementation(() => undefined)
    onMessagesCreated("][}{")
    expect(insertMessages).toHaveBeenCalledTimes(0)
  })
})