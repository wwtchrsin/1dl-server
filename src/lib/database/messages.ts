import { queryDatabase } from "./conn"
import { getTimestamp } from "./miscs"
import logger from "../logger"
import type { Location, Messageid, MessageContent, UserMessage, Message } from "./interfaces"


export const getMessages = async (location: Location): 
  Promise<{ error: string | undefined, data: Message[] | undefined }> => {
    let TAG = "db/messages/getMessages"
    let { region, tag } = location
    let query = `
      SELECT users.region as region, tag, index, text, messages.color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        messages.region = $1 AND tag = $2
    `
    let result = await queryDatabase(query, [region, tag])
    if ( !result?.rows ) {
      logger.error({ location }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getMessages",
        data: undefined
      }
    }
    logger.debug({ location }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows,
    }
  }

export const getMessage = async (messageid: Messageid):
  Promise<{ error: string | undefined, data: Message | undefined }> => {
    let TAG = "db/messages/getMessage"
    let { region, tag, index } = messageid
    let query = `
      SELECT messages.region as region, tag, index, text, messages.color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        messages.region = $1 AND tag = $2 AND index = $3
    `
    let result = await queryDatabase(query, [region, tag, index])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error({ messageid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getMessage",
        data: undefined,
      }
    }
    if ( result?.rows?.length === 0 ) {
      logger.info({ messageid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.messageNotFound",
        data: undefined,
      }
    }
    logger.debug({ messageid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows[0],
    }
  }

export const getUserMessages = async (userid: string): 
  Promise<{ error: string | undefined, data: UserMessage[] }> => {
    let TAG = "db/messages/getUserMessages"
    let query = `
      SELECT region, tag, index, text, color, timestamp
        FROM messages WHERE userid = $1
    `
    let result = await queryDatabase(query, [userid])
    if ( result === undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getUserMessages",
        data: undefined,
      }
    }
    logger.debug({ userid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows,
    }
  }

export const createMessage = async (userid: string, messageid: Messageid, content: MessageContent): 
  Promise<{ error: string | undefined, data: UserMessage | undefined }> => {
    let TAG = "db/messages/createMessage"    
    let { region, tag, index } = messageid
    let { text, color } = content
    let message = await getMessage({ region, tag, index })
    if ( message.error === "databaseError.getMessage" ) {
      logger.error({ userid, messageid, content }, `${TAG}#ERROR_GET_MESSAGE`)
      return {
        error: "databaseError.checkMessage",
        data: undefined,
      }
    }
    if ( message.data !== undefined ) {
      logger.info({ userid, messageid, content }, `${TAG}#ERROR_MESSAGE_EXISTS`)
      return {
        error: "databaseConflict.messageAlreadyExists",
        data: undefined,
      }
    }
    let query = `
      INSERT INTO messages VALUES 
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING region, tag, index, text, color, timestamp
    `
    let queryParams = [region, tag, index, text, color, userid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      logger.error({ userid, messageid, content }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.createMessage",
        data: undefined,
      }
    }
    logger.debug({ userid, messageid, content }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows[0],
    }
  }

export const deleteMessage = async (userid: string, messageid: Messageid):
  Promise<{ error: string | undefined, data: UserMessage | undefined }> => {
    let TAG = "db/messages/deleteMessage"
    let { region, tag, index } = messageid as Messageid
    let query = `
      DELETE FROM messages 
        WHERE userid = $1 AND region = $2 AND tag = $3 AND index = $4
        RETURNING region, tag, index, text, color, timestamp
    `
    let queryParams = [userid, region, tag, index]
    let result = await queryDatabase(query, queryParams)
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ userid, messageid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.deleteMessage",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.info({ userid, messageid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.messageNotFound",
        data: undefined,
      }
    }
    logger.debug({ userid, messageid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows[0],
    }
  }
    
    

    
  
  

