import { checkDistrictid, checkRoomid, checkMessageid, checkMessageContent, 
  checkUserid } from "./checkers"
import { queryDatabase } from "./conn"
import { databaseErrors, databaseConflicts } from "../error-messages"
import { getTimestamp } from "./miscs"
import logger from "../logger"
import type { TextResource } from "../langs"

export type Districtid = {
  region: string,
  district: string,
}

export type Roomid = Districtid & {
  room: string,
}

export type Messageid = Roomid & {
  index: string,
}

export type MessageContent = {
  text: string,
  color: string,
}

export type UserMessage = {
  region: string,
  district: number,
  room: number,
  index: number,
  text: string,
  color: string,
  timestamp: string
}

export type Message = UserMessage & {
  puid: string,
  username: string,
}

export type RoomMessageCount = {
  room: number,
  msgs: number,
}

export const getDistrictStats = async (districtid: any):
  Promise<{ error: string | undefined, data: RoomMessageCount[] | undefined }> => {
    let errorMessage = checkDistrictid(districtid)
    if ( errorMessage !== undefined ) {
      logger.warn(districtid, "db/messages/getDistrictStats#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district } = districtid as Districtid
    let query = `
      SELECT room, COUNT(*) as msgs FROM messages
        WHERE region = $1 AND district = $2
        GROUP BY room
    `
    let result = await queryDatabase(query, [region, district])
    if ( !result ) {
      logger.error(districtid, "db/messages/getDistrictStats#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getDistrictStats",
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as RoomMessageCount[],
    }
  }

export const getMessages = async (roomid: any): 
  Promise<{ error: string | undefined, data: Message[] | undefined }> => {
    let errorMessage = checkRoomid(roomid)
    if ( errorMessage !== undefined ) {
      logger.warn(roomid, "db/messages/getMessages#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room } = roomid as Roomid
    let query = `
      SELECT region, district, room, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3
    `
    let result = await queryDatabase(query, [region, district, room])
    if ( !result?.rows ) {
      logger.error(roomid, "db/messages/getMessages#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getMessages",
        data: undefined
      }
    }
    return {
      error: undefined,
      data: result.rows as Message[]
    }
  }

export const getMessage = async (messageid: any):
  Promise<{ error: string | undefined, data: Message | undefined }> => {
    let errorMessage = checkMessageid(messageid)
    if ( errorMessage !== undefined ) {
      logger.warn(messageid, "db/messages/getMessage#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { region, district, room, index } = messageid as Messageid
    let query = `
      SELECT region, district, room, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        region = $1 AND district = $2 AND room = $3 AND index = $4
    `
    let result = await queryDatabase(query, [region, district, room, index])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error(messageid, "db/messages/getMessage#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getMessage",
        data: undefined,
      }
    }
    if ( result?.rows?.length === 0 ) {
      logger.warn(messageid, "db/messages/getMessage#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as Message,
    }
  }

export const getUserMessages = async (userid: string): 
  Promise<{ error: string | undefined, data: UserMessage[] }> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid }, "db/messages/getUserMessages#ERROR_ID_CHECK")
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let query = `
      SELECT region, district, room, index, text, color, timestamp
        FROM messages WHERE userid = $1
    `
    let result = await queryDatabase(query, [userid])
    if ( result === undefined ) {
      logger.error({ userid }, "db/messages/getUserMessages#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getUserMessages",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows as UserMessage[],
    }
  }

export const createMessage = async (userid: string, messageid: any, content: any): 
  Promise<{ error: string | undefined, data: UserMessage | undefined }> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid, messageid, content }, "db/messages/createMessage#ERROR_ID_CHECK")
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let messageidCheckError = checkMessageid(messageid)
    if ( messageidCheckError !== undefined ) {
      logger.warn(messageid, "db/messages/getMessage#ERROR_ID_CHECK")
      return {
        error: messageidCheckError,
        data: undefined,
      }
    }
    let contentCheckError = checkMessageContent(content)
    if ( contentCheckError !== undefined ) {
      logger.warn({ userid, messageid, content }, "db/messages/createMessage#ERROR_CONTENT_CHECK")
      return {
        error: contentCheckError,
        data: undefined,
      }
    }
    let { region, district, room, index } = messageid as Messageid
    let { text, color } = content as MessageContent
    let message = await getMessage({ region, district, room, index })
    if ( message.error === "databaseErrors.getMessage" ) {
      logger.error({ userid, messageid, content }, "db/messages/createMessage#ERROR_GET_MESSAGE")
      return {
        error: "databaseErrors.checkMessage",
        data: undefined,
      }
    }
    if ( message.data !== undefined ) {
      logger.warn({ userid, messageid, content }, "db/messages/createMessage#ERROR_MESSAGE_EXISTS")
      return {
        error: "databaseConflicts.messageAlreadyExists",
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
      logger.error({ userid, messageid, content }, "db/messages/createMessage#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.createMessage",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as UserMessage,
    }
  }

export const deleteMessage = async (userid: string, messageid: any):
  Promise<{ error: TextResource | undefined, data: UserMessage | undefined }> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid, messageid }, "db/messages/deleteMessage#ERROR_USER_ID")
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let messageidCheckError = checkMessageid(messageid)
    if ( messageidCheckError !== undefined ) {
      logger.warn({ userid, messageid }, "db/messages/deleteMessage#ERROR_MESSAGE_ID")
      return {
        error: messageidCheckError,
        data: undefined,
      }
    }
    let { region, district, room, index } = messageid as Messageid
    let query = `
      DELETE FROM messages 
        WHERE userid = $1 AND region = $2 AND district = $3 AND 
          room = $4 AND index = $5
        RETURNING region, district, room, index, text, color, timestamp
    `
    let queryParams = [userid, region, district, room, index]
    let result = await queryDatabase(query, queryParams)
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ userid, messageid }, "db/messages/deleteMessage#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.deleteMessage",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.warn({ userid, messageid }, "db/messages/deleteMessage#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.messageNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as UserMessage,
    }
  }
    
    

    
  
  

