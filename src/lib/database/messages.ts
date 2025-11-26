import { checkRoomIds, checkMessageIds, checkMessageContent, checkUserId } from "./checkers"
import { queryDatabase } from "./conn"
import { databaseErrors, databaseConflicts, errorsEqual } from "../error-messages"
import { getTimestamp } from "./miscs"
import logger from "../logger"
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
  district: string,
  room: string,
  index: string,
  text: string,
  color: string,
}

export type CreatedMessage = {
  region: string,
  district: number,
  room: number,
  index: number,
  text: string,
  color: string,
  timestamp: string
}

export type Message = CreatedMessage & {
  puid: string,
  username: string,
}

export const getMessages = async (req: any): 
  Promise<{ error: TextResource | undefined, data: Message[] | undefined }> => {
    let errorMessage = checkRoomIds(req)
    if ( errorMessage !== undefined ) {
      logger.warn(req, "db/messages/getMessages#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room } = req as RoomIds
    let query = `
      SELECT region, district, room, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3
    `
    let result = await queryDatabase(query, [region, district, room])
    if ( !result?.rows ) {
      logger.error(req, "db/messages/getMessages#ERROR_DB_QUERY")
      return {
        error: databaseErrors.getMessages,
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as Message[]
    }
  }

export const getMessage = async (req: any):
  Promise<{ error: TextResource | undefined, data: Message | undefined }> => {
    let errorMessage = checkMessageIds(req)
    if ( errorMessage !== undefined ) {
      logger.warn(req, "db/messages/getMessage#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room, index } = req as MessageIds
    let query = `
      SELECT region, district, room, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3 AND index = $4
    `
    let result = await queryDatabase(query, [region, district, room, index])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error(req, "db/messages/getMessage#ERROR_DB_QUERY")
      return {
        error: databaseErrors.getMessage,
        data: undefined,
      }
    }
    if ( result?.rows?.length === 0 ) {
      logger.warn(req, "db/messages/getMessage#ERROR_NOT_FOUND")
      return {
        error: databaseConflicts.messageNotFound,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as Message,
    }
  }

export const createMessage = async (userid: string, req: any): 
  Promise<{ error: TextResource | undefined, data: CreatedMessage | undefined }> => {
    let useridCheckError = checkUserId(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid, ...req }, "db/messages/createMessage#ERROR_ID_CHECK")
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let errorMessage = checkMessageContent(req)
    if ( errorMessage !== undefined ) {
      logger.warn({ userid, ...req }, "db/messages/createMessage#ERROR_DATA_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room, index, text, color } = req as MessageContent
    let message = await getMessage({ region, district, room, index })
    if ( errorsEqual(message.error, databaseErrors.getMessage) ) {
      logger.error({ userid, ...req }, "db/messages/createMessage#ERROR_GET_MESSAGE")
      return {
        error: databaseErrors.checkMessage,
        data: undefined,
      }
    }
    if ( message.data !== undefined ) {
      logger.warn({ userid, ...req }, "db/messages/createMessage#ERROR_MESSAGE_EXISTS")
      return {
        error: databaseConflicts.messageAlreadyExists,
        data: undefined,
      }
    }
    let query = `
      INSERT INTO messages VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING region, district, room, index, text, color, timestamp
    `
    let queryParams = [region, district, room, index, text, color, userid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      logger.error({ userid, ...req }, "db/messages/createMessage#ERROR_DB_QUERY")
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


    
  
  

