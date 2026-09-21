import { Message, Messageid } from "../database/interfaces"

export type CreatedMessages = {
  messages: Message[],
}

export type DeletedMessages = {
  messageids: Messageid[],
}

export type CreatedSessions = {
  deviceids: string[]
}

export type DeletedSessions = {
  deviceids: string[]
}

