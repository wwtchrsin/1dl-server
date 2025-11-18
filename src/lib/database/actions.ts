import { checkRoomIds, checkMessageIds, checkMessageContent } from "./checkers"
import { queryDatabase } from "./conn"
import { databaseErrors, databaseConflicts, errorsEqual } from "../error-messages"
import type { TextResource } from "../langs"

export type RoomIds = {
  region: string,
  district: string,
  room: string,
}

export type MessageIds = {
  region: string,
  district: string,
  room: string,
  index: string,
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
        error: databaseErrors.getMessages,
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as ResponseMessage[]
    }
  }

export const getMessage = async (req: any):
  Promise<{ error: TextResource | undefined, data: ResponseMessage | undefined }> => {
    let errorMessage = checkMessageIds(req)
    if ( errorMessage !== undefined ) {
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room, index } = req as MessageIds
    let query = `
      SELECT region, district, room, index, text, color, 
          name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3 AND index = $4
    `
    let result = await queryDatabase(query, [region, district, room, index])
    if ( result === undefined || result?.rows?.length > 1 ) {
      return {
        error: databaseErrors.getMessage,
        data: undefined,
      }
    }
    if ( result?.rows?.length === 0 ) {
      return {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as ResponseMessage,
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
    let message = await getMessage({ region, district, room, index })
    if ( errorsEqual(message.error, databaseErrors.getMessage) ) {
      return {
        error: databaseErrors.createMessage,
        data: undefined,
      }
    }
    if ( message.data !== undefined ) {
      return {
        error: databaseConflicts.messageAlreadyExists,
        data: undefined,
      }
    }
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
        error: databaseErrors.createMessage,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as CreatedMessage,
    }
  }

export const useridExists = async (userid: string): 
  Promise<{ error: TextResource | undefined, data: boolean | undefined }> => {
    let query = "SELECT userid FROM users WHERE userid = $1"
    let result = await queryDatabase(query, [userid])
    if ( result === undefined || result?.rows?.length > 1 ) {
      return {
        error: databaseErrors.checkUserExists,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result?.rows?.length === 1,
    }
  }

export const loginExists = async (login: string):
  Promise<{ error: TextResource | undefined, data: boolean | undefined }> => {
    let query = "SELECT login FROM users WHERE login = $1"
    let result = await queryDatabase(query, [login])
    if ( result === undefined || result?.rows?.length > 1 ) {
      return {
        error: databaseErrors.checkUserExists,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result?.rows?.length === 1,
    }
  }
  

