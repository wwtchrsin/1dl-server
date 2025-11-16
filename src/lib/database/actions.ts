import { checkRoomIds, checkMessageContent } from "./checkers"
import { queryDatabase } from "./query"
import { databaseError } from "../error-messages"
import type { TextResource } from "../langs"

export type RoomIds = {
  region: string,
  district: string,
  room: string,
}

export type MessageContent = {
  region: string,
  district: number,
  room: number,
  index: number,
  text: string,
  color: string,
}

export type CreatedMessage = MessageContent & {
  timestamp: string
}

export type ResponseMessage = CreatedMessage & {
  username: string
}

export const getMessages = async (req: any): 
  Promise<{ error: TextResource | undefined, data: ResponseMessage[] | undefined }> => {
    let errorMessage = checkRoomIds(req)
    if ( errorMessage !== undefined ) {
      return { 
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room } = req as RoomIds
    let query = `
      SELECT region, district, room, index, text, color, 
          name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3
    `
    let result = await queryDatabase(query, [region, district, room])
    if ( !result?.rows ) {
      return {
        error: databaseError.getMessages,
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as ResponseMessage
    }
  }

export const createMessage = async (userid: string, req: any): 
  Promise<{ error: TextResource | undefined, data: CreatedMessage | undefined }> => {
    let errorMessage = checkMessageContent(req)
    if ( errorMessage !== undefined ) {
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room, index, text, color } = req as MessageContent
    let timestamp = (new Date()).valueOf()
    let query = `
      INSERT INTO messages VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING region, district, room, index, text, color, timestamp
    `
    let queryParams = [region, district, room, index, text, color, userid, timestamp]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      return {
        error: databaseError.createMessage,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as CreatedMessage,
    }
  }
