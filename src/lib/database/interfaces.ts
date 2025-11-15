export interface RoomParams {
  region: string
  district: string
  room: string
}

export interface MessageListEntry {
  region: string
  district: number
  room: number
  index: number
  text: string
  color: string
  username: string
  timestamp: string
}

export type MessageList = MessageListEntry[] 
