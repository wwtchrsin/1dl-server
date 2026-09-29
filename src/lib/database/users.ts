import { randomUUID } from "node:crypto"
import { queryDatabase, executeTransaction } from "./conn"
import { getUserMessages } from "./messages"
import { hashPassword, hashSession, generateToken, getTimestamp,
  redactPassword } from "./miscs"
import logger from "../logger"
import type { UserData, Profile, Credentials, UserMessage } from "./interfaces"

export const userExists = async (login: string, name: string):
  Promise<{ error: string | undefined, data: boolean | undefined }> => {
    let TAG = "db/users/userExists"
    let query = "SELECT login, name FROM users WHERE login = $1 OR name = $2"
    let result = await queryDatabase(query, [login, name])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error({ login, name }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.checkUserExists",
        data: undefined,
      }
    }
    logger.debug({ login, name }, `${TAG}#DONE`)
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
    let checkResult = await userExists(login, name)
    if ( checkResult.error !== undefined ) {
      logger.error(args, `${TAG}#ERROR_USER_CHECK`)
      return {
        error: checkResult.error,
        data: undefined,
      }
    }
    if ( checkResult.data !== false ) {
      logger.info(args, `${TAG}#ERROR_USER_EXISTS`)
      return {
        error: "databaseConflict.userExists",
        data: undefined,
      }
    }
    let userid = randomUUID()
    let puid = randomUUID()
    let passwordHash = hashPassword(login, password)
    let query = `
      INSERT INTO users VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING userid, region, login, name, color, state, puid, timestamp
    `
    let queryParams = [userid, region, login, passwordHash, name, 
      null, defaultState, puid, getTimestamp()]
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

export const deleteSession = async (userid: string): 
  Promise<{ error: string | undefined, deviceid: string | undefined }> => {
    let TAG = "db/users/deleteSession"
    let query = "DELETE FROM sessions WHERE userid = $1 RETURNING deviceid"
    let result = await queryDatabase(query, [userid])
    if ( !result || result.rows.length > 1 ) {
      logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.deleteSession",
        deviceid: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.info({ userid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.sessionNotFound",
        deviceid: undefined,
      }
    }
    logger.debug({ userid }, `${TAG}#DONE`)
    return {
      error: undefined,
      deviceid: result.rows[0].deviceid,
    }
  }

export const verifyCredentials = async (credentials: Credentials):
  Promise<{ error: string | undefined, userid: string | undefined }> => {
    let TAG = "db/users/verifyCredentials"
    let args = { credentials: redactPassword(credentials) }
    let { region, login, password } = credentials
    let passwordHash = hashPassword(login, password)
    let query = `
      SELECT userid FROM users 
        WHERE region = $1 AND login = $2 AND password = $3
    `
    let queryParameters = [region, login, passwordHash]
    let result = await queryDatabase(query, queryParameters)
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error(args, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.verifyCredentials",
        userid: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.info(args, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.profileNotFound",
        userid: undefined,
      }
    }
    return {
      error: undefined,
      userid: result.rows[0].userid
    }
  }

export const createSession = async (userid: string, deviceid: string):
  Promise<{ error: string | undefined, sessionid: string | undefined,
  deviceid: string | undefined }> => {
    let TAG = "db/users/createSession"
    let args = { userid, deviceid }
    let deleteQuery = "DELETE FROM sessions WHERE userid = $1 RETURNING deviceid"
    let deleteResult = await queryDatabase(deleteQuery, [userid])
    if ( deleteResult === undefined ) {
      logger.error(args, `${TAG}#ERROR_SESSION_REMOVE`)
      return {
        error: "databaseError.deleteSession",
        sessionid: undefined,
        deviceid: undefined,
      }
    }
    let prevDeviceid = deleteResult.rows.length && deleteResult.rows[0]?.deviceid
    let sessionid = await generateToken()
    let sessionHash = hashSession(sessionid)
    let query = "INSERT INTO sessions VALUES($1, $2, $3, $4)"
    let queryParams = [userid, sessionHash, deviceid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result === undefined || result.rowCount !== 1 ) {
      logger.error(args, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.createSession",
        sessionid: undefined,
        deviceid: prevDeviceid,
      }
    }
    logger.debug(args, `${TAG}#DONE`)
    return {
      error: undefined,
      sessionid: sessionid,
      deviceid: prevDeviceid,
    }
  }
     
export const getProfile = async (userid: string): 
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let TAG = "db/users/getProfile"
    let query = `
      SELECT userid, region, login, name, color, state, puid, timestamp
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

export const getDeviceid = async (userid: string):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let TAG = "db/users/getDeviceid"
    let query = "SELECT deviceid FROM sessions WHERE userid = $1"
    let result = await queryDatabase(query, [userid])
    if ( result === undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_DB_QUERY`)
      return {
        error: "databaseError.getDeviceid",
        data: undefined,
      }
    }
    if ( result.rows.length !== 1 ) {
      logger.info({ userid }, `${TAG}#ERROR_NOT_FOUND`)
      return {
        error: "databaseConflict.sessionNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0].deviceid,
    }
  }

export const deleteProfile = async (userid: string):
  Promise<{ error: string | undefined, messages: UserMessage[] | undefined, 
  profile: Profile | undefined, deviceid: string | undefined }> => {
    let TAG = "db/users/deleteProfile"
    let profile = await getProfile(userid)
    if ( profile.error !== undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_GETTING_PROFILE`)
      return {
        error: profile.error,
        messages: undefined,
        profile: undefined,
        deviceid: undefined,
      }
    }
    let messages = await getUserMessages(userid)
    if ( messages.error !== undefined ) {
      logger.error({ userid }, `${TAG}#ERROR_GETTING_MESSAGES`)
      return {
        error: messages.error,
        messages: undefined,
        profile: undefined,
        deviceid: undefined,
      }
    }
    let deviceid = await getDeviceid(userid)
    if ( deviceid.error && deviceid.error !== "databaseConflict.sessionNotFound" ) {
      logger.error({ userid }, `${TAG}#ERROR_GETTING_DEVICEID`)
      return {
        error: deviceid.error,
        messages: undefined,
        profile: undefined,
        deviceid: undefined,
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
        deviceid: undefined,
      }
    }
    logger.debug({ userid }, `${TAG}#DONE`)
    return {
      error: undefined,
      messages: messages.data,
      profile: profile.data,
      deviceid: deviceid.data,
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

  export const updateProfileColor = async (userid: string, color: string): 
    Promise<{ error: string | undefined }> => {
      let TAG = "db/users/updateProfileColor"
      let query = "UPDATE users SET color = $2 WHERE userid = $1"
      let result = await queryDatabase(query, [userid, color])
      if ( !result || result.rowCount > 1 ) {
        logger.error({ userid, color }, `${TAG}#ERROR_DB_QUERY`)
        return { error: "databaseError.updateProfileColor" }
      }
      if ( result.rowCount === 0 ) {
        logger.error({ userid, color }, `${TAG}#ERROR_NOT_FOUND`)
        return { error: "databaseConflict.profileNotFound" }
      }
      logger.debug({ userid, color }, `${TAG}#DONE`)
      return { error: undefined }
    }
    

  
    
  

