import { queryDatabase } from "./conn"
import { getTimestamp, processZoneMsgcounts, processDistrictMsgcounts } from "./miscs"
import logger from "../logger"
import type { Districtid, Zoneid, Messageid, MessageContent, UserMessage,
  Message, ZoneMsgcount, DistrictMsgcount, Msgcounts } from "./interfaces"

export const countRegionMessages = async (region: string | undefined):
  Promise<{ error: string | undefined, data: Msgcounts | undefined }> => {
    let TAG = "db/messages/countRegionMessages"
    let query = `
      SELECT district, COUNT(*)::INTEGER as msgcount FROM messages
        WHERE region = $1
        GROUP BY district
    `
    let result = await queryDatabase(query, [region as string])
    if ( !result ) {
      logger.error({ region }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.countRegionMessages",
        data: undefined,
      }
    }
    let data = processDistrictMsgcounts(result.rows as DistrictMsgcount[])
    logger.debug({ region }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: data,
    }
  }

export const countDistrictMessages = async (districtid: Districtid):
  Promise<{ error: string | undefined, data: Msgcounts | undefined }> => {
    let TAG = "db/messages/countDistrictMessages"
    let { region, district } = districtid as Districtid
    let query = `
      SELECT zone, COUNT(*)::INTEGER as msgcount FROM messages
        WHERE region = $1 AND district = $2
        GROUP BY zone
    `
    let result = await queryDatabase(query, [region, district])
    if ( !result ) {
      logger.error({ districtid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.countDistrictMessages",
        data: undefined
      }
    }
    let data = processZoneMsgcounts(result.rows as ZoneMsgcount[])
    logger.debug({ districtid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: data,
    }
  }

export const getMessages = async (zoneid: Zoneid): 
  Promise<{ error: string | undefined, data: Message[] | undefined }> => {
    let TAG = "db/messages/getMessages"
    let { region, district, zone } = zoneid
    let query = `
      SELECT users.region as region, district, zone, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        messages.region = $1 AND district = $2 AND zone = $3
    `
    let result = await queryDatabase(query, [region, district, zone])
    if ( !result?.rows ) {
      logger.error({ zoneid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getMessages",
        data: undefined
      }
    }
    logger.debug({ zoneid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows,
    }
  }

export const getMessage = async (messageid: Messageid):
  Promise<{ error: string | undefined, data: Message | undefined }> => {
    let TAG = "db/messages/getMessage"
    let { region, district, zone, index } = messageid
    let query = `
      SELECT messages.region as region, district, zone, index, text, color, 
          users.puid as puid, name as username, messages.timestamp as timestamp  
        FROM messages, users WHERE
        messages.userid = users.userid AND 
        messages.region = $1 AND district = $2 AND zone = $3 AND index = $4
    `
    let result = await queryDatabase(query, [region, district, zone, index])
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
      SELECT region, district, zone, index, text, color, timestamp
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
    let { region, district, zone, index } = messageid
    let { text, color } = content
    let message = await getMessage({ region, district, zone, index })
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
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING region, district, zone, index, text, color, timestamp
    `
    let queryParams = [region, district, zone, index, text, color, userid, getTimestamp()]
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
    let { region, district, zone, index } = messageid as Messageid
    let query = `
      DELETE FROM messages 
        WHERE userid = $1 AND region = $2 AND district = $3 AND 
          zone = $4 AND index = $5
        RETURNING region, district, zone, index, text, color, timestamp
    `
    let queryParams = [userid, region, district, zone, index]
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
    
    

    
  
  

