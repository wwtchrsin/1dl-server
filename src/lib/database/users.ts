import { randomUUID } from "node:crypto"
import { queryDatabase, executeTransaction } from "./conn"
import { getUserMessages } from "./messages"
import { hashPassword, hashSession, generateToken, getTimestamp,
  redactPassword } from "./miscs"
import logger from "../logger"
import type { UserData, Profile, Credentials, UserMessage } from "./interfaces"

export const loginExists = async (login: string):
  Promise<{ error: string | undefined, data: boolean | undefined }> => {
    let TAG = "db/users/loginExists"
    let query = "SELECT login FROM users WHERE login = $1"
    let result = await queryDatabase(query, [login])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error({ login }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.checkUserExists",
        data: undefined,
      }
    }
    logger.debug({ login }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result?.rows?.length === 1,
    }
  }

export const createProfile = async(userData: UserData, defaultState: string):
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let TAG = "db/users/createProfile"
    let args = { userData: redactPassword(userData), defaultState }
    let { region, login, password, name } = userData
    let checkResult = await loginExists(login)
    if ( checkResult.error !== undefined ) {
      logger.error(args, `${TAG}#ERROR_LOGIN_CHECK`)
      return {
        error: checkResult.error,
        data: undefined,
      }
    }
    if ( checkResult.data !== false ) {
      logger.info(args, `${TAG}#ERROR_LOGIN_TAKEN`)
      return {
        error: "databaseConflict.loginTaken",
        data: undefined,
      }
    }
    let userid = randomUUID()
    let puid = randomUUID()
    let passwordHash = hashPassword(login, password)
    let query = `
      INSERT INTO users VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING userid, region, login, name, state, puid, timestamp
    `
    let queryParams = [userid, region, login, passwordHash, name, 
      defaultState, puid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      logger.error(args, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.createProfile",
        data: undefined,
      }
    }
    logger.debug(args, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result!.rows![0],
    }
  }

export const deleteSession = async (userid: string): Promise<string | undefined> => {
  let TAG = "db/users/deleteSession"
  let query = "DELETE FROM sessions WHERE userid = $1"
  let result = await queryDatabase(query, [userid])
  if ( !result || result.rowCount > 1 ) {
    logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
    return "databaseError.deleteSession"
  }
  if ( result.rowCount === 0 ) {
    logger.info({ userid }, `${TAG}#ERROR_NOT_FOUND`)
    return "databaseConflict.sessionNotFound"
  }
  logger.debug({ userid }, `${TAG}#DONE`)
  return undefined
}

export const createSession = async (credentials: Credentials):
  Promise<{ error: string | undefined, sessionid: string | undefined, 
  userid: string | undefined }> => {
    let TAG = "db/users/createSession"
    let args = { credentials: redactPassword(credentials) }
    let { region, login, password, identifier } = credentials
    let passwordHash = hashPassword(login, password)
    let checkQuery = `
      SELECT userid FROM users 
        WHERE region = $1 AND login = $2 AND password = $3
    `
    let queryParameters = [region, login, passwordHash]
    let checkResult = await queryDatabase(checkQuery, queryParameters)
    if ( !checkResult?.rows || checkResult.rows.length > 1 ) {
      logger.error(args, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.checkCredentials",
        sessionid: undefined,
        userid: undefined,
      }
    }
    if ( checkResult.rows.length === 0 ) {
      logger.info(args, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.profileNotFound",
        sessionid: undefined,
        userid: undefined,
      }
    }
    let { userid } = checkResult.rows[0]
    let deleteQuery = "DELETE FROM sessions WHERE userid = $1"
    let deleteResult = await queryDatabase(deleteQuery, [userid])
    if ( deleteResult === undefined ) {
      logger.error(args, `${TAG}#ERROR_SESSION_REMOVE`)
      return {
        error: "databaseError.deleteSession",
        sessionid: undefined,
        userid: undefined,
      }
    }
    let sessionid = await generateToken()
    let sessionHash = hashSession(sessionid)
    let query = "INSERT INTO sessions VALUES($1, $2, $3, $4)"
    let queryParams = [userid, sessionHash, identifier, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result === undefined || result.rowCount !== 1 ) {
      logger.error(args, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.createSession",
        sessionid: undefined,
        userid: undefined,
      }
    }
    logger.debug(args, `${TAG}#DONE`)
    return {
      error: undefined,
      sessionid: sessionid,
      userid: userid,
    }
  }
     
export const getProfile = async (userid: string): 
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let TAG = "db/users/getProfile"
    let query = `
      SELECT userid, region, login, name, state, puid, timestamp
        FROM users WHERE userid = $1
    `
    let result = await queryDatabase(query, [userid])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getProfile",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.info({ userid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.profileNotFound",
        data: undefined,
      }
    }
    logger.debug({ userid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows[0],
    }
  }

export const deleteProfile = async (userid: string):
  Promise<{ error: string | undefined, messages: UserMessage[] | undefined, 
  profile: Profile | undefined }> => {
    let TAG = "db/users/deleteProfile"
    let profile = await getProfile(userid)
    if ( profile.error !== undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_GETTING_PROFILE`)
      return {
        error: profile.error,
        messages: undefined,
        profile: undefined,
      }
    }
    let messages = await getUserMessages(userid)
    if ( messages.error !== undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_GETTING_MESSAGES`)
      return {
        error: messages.error,
        messages: undefined,
        profile: undefined,
      }
    }
    let query = `
      DELETE FROM messages WHERE userid = '${userid}';
      DELETE FROM sessions WHERE userid = '${userid}';
      DELETE FROM users WHERE userid = '${userid}';
    `
    let result = await executeTransaction(query)
    if ( !result ) {
      logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.deleteProfile",
        messages: undefined,
        profile: undefined,
      }
    }
    logger.debug({ userid }, `${TAG}#DONE`)
    return {
      error: undefined,
      messages: messages.data,
      profile: profile.data,
    }
  }

export const getUserid = async (sessionid: string):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let TAG = "db/users/getUserid"
    let sessionHash = hashSession(sessionid)
    let query = "SELECT userid FROM sessions WHERE sessionid = $1"
    let result = await queryDatabase(query, [sessionHash])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ sessionid: !!sessionid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getUserid",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.info({ sessionid: !!sessionid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.sessionNotFound",
        data: undefined,
      }
    }
    logger.debug({ sessionid: !!sessionid }, `${TAG}#DONE`)
    return {
      error: undefined,
      data: result.rows[0].userid
    }
  }

  
    

  
    
  

