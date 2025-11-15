import { checkRoomParams } from "./checkers"
import { queryDatabase } from "./query"
import { databaseError } from "../error-messages"
import type { RoomParams, MessageList } from "./interfaces"
import type { TextResource } from "../langs"

export const getMessages = async (req: any): 
  Promise<{ error: TextResource | undefined, data: MessageList | undefined }> => {
    let errorMessage = checkRoomParams(req)
    if ( errorMessage !== undefined ) {
      return { 
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room } = req as RoomParams
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
        error: databaseError.messages,
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as MessageList
    }
  }

