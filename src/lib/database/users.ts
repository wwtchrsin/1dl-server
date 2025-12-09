import { randomUUID } from "node:crypto"
import { checkUserData, checkUserid, checkSessionid, checkUserCredentials } from "./checkers"
import { queryDatabase, executeTransaction } from "./conn"
import { databaseErrors, databaseConflicts } from "../error-messages"
import { getUserMessages } from "./messages"
import { hashPassword, hashSession, generateToken, getTimestamp } from "./miscs"
import type { UserMessage } from "../messages"
import logger from "../logger"

export type ProfileData = {
  login: string,
  password: string,
  name: string,
}

export type Profile = {
  userid: string,
  login: string,
  name: string,
  state: string,
  puid: string,
  timestamp: string,
}

export type Credentials = {
  login: string,
  password: string,
}

export const loginExists = async (login: string):
  Promise<{ error: string | undefined, data: boolean | undefined }> => {
    let query = "SELECT login FROM users WHERE login = $1"
    let result = await queryDatabase(query, [login])
    if ( result === undefined || result?.rows?.length > 1 ) {
      logger.error({ login }, "db/users/loginExists#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.checkUserExists",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result?.rows?.length === 1,
    }
  }

export const createProfile = async(req: any, defaultState: string):
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let errorMessage = checkUserData(req)
    if ( errorMessage !== undefined ) {
      logger.warn(req, "db/users/createProfile#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { login, password, name } = req as ProfileData
    let checkResult = await loginExists(login)
    if ( checkResult.error !== undefined ) {
      logger.error(req, "db/users/createProfile#ERROR_LOGIN_CHECK")
      return {
        error: checkResult.error,
        data: undefined,
      }
    }
    if ( checkResult.data !== false ) {
      logger.warn(req, "db/users/createProfile#ERROR_LOGIN_TAKEN")
      return {
        error: "databaseConflicts.loginTaken",
        data: undefined,
      }
    }
    let userid = randomUUID()
    let puid = randomUUID()
    let passwordHash = hashPassword(login, password)
    let query = `
      INSERT INTO users VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING userid, login, name, state, puid, timestamp
    `
    let queryParams = [userid, login, passwordHash, name, defaultState, puid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      logger.error(req, "db/users/createProfile#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.createProfile",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result!.rows![0] as Profile,
    }
  }

export const deleteSession = async (userid: string): Promise<string | undefined> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid }, "db/users/deleteSession#ERROR_ARGS_CHECK")
      return useridCheckError
    }
    let query = "DELETE FROM sessions WHERE userid = $1"
    let result = await queryDatabase(query, [userid])
    if ( !result || result.rowCount > 1 ) {
      logger.error({ userid }, "db/users/deleteSession#ERROR_DB_QUERY")
      return "databaseErrors.deleteSession"
    }
    if ( result.rowCount === 0 ) {
      logger.warn({ userid }, "db/users/deleteSession#ERROR_NOT_FOUND")
      return "databaseConflicts.sessionNotFound"
    }
    return undefined
  }

export const createSession = async (req: any):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let credentialsError = checkUserCredentials(req)
    if ( credentialsError !== undefined ) {
      logger.warn(req, "db/users/createSession#ERROR_ARGS_CHECK")
      return {
        error: credentialsError,
        data: undefined,
      }
    }
    let { login, password } = req as Credentials
    let passwordHash = hashPassword(login, password)
    let checkQuery = "SELECT userid FROM users WHERE login = $1 AND password = $2"
    let checkResult = await queryDatabase(checkQuery, [login, passwordHash])
    if ( !checkResult?.rows || checkResult.rows.length > 1 ) {
      logger.error(req, "db/users/createSession#ERROR_CREDENTIALS_CHECK")
      return {
        error: "databaseErrors.checkCredentials",
        data: undefined,
      }
    }
    if ( checkResult.rows.length === 0 ) {
      logger.warn(req, "db/users/createSession#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.profileNotFound",
        data: undefined,
      }
    }
    let { userid } = checkResult.rows[0]
    let deleteQuery = "DELETE FROM sessions WHERE userid = $1"
    let deleteResult = await queryDatabase(deleteQuery, [userid])
    if ( deleteResult === undefined ) {
      logger.error(req, "db/users/createSession#ERROR_SESSION_REMOVE")
      return {
        error: "databaseErrors.deleteSession",
        data: undefined,
      }
    }
    let sessionid = await generateToken()
    let sessionHash = hashSession(sessionid)
    let query = "INSERT INTO sessions VALUES($1, $2, $3)"
    let queryParams = [userid, sessionHash, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result === undefined || result.rowCount !== 1 ) {
      logger.error(req, "db/users/createSession#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.createSession",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: sessionid,
    }
  }
     
export const getProfile = async (userid: string): 
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid }, "db/users/getProfile#ERROR_ARGS_CHECK")
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let query = `
      SELECT userid, login, name, state, puid, timestamp
        FROM users WHERE userid = $1
    `
    let result = await queryDatabase(query, [userid])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ userid }, "db/users/getProfile#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getProfile",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.warn({ userid }, "db/users/getProfile#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.profileNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as Profile,
    }
  }

export const deleteProfile = async (userid: string):
  Promise<{ error: string | undefined, messages: UserMessage[] | undefined, profile: Profile | undefined }> => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      logger.warn({ userid }, "db/users/deleteProfile#ERROR_ARGS_CHECK")
      return {
        error: useridCheckError,
        messages: undefined,
        profile: undefined,
      }
    }
    let profile = await getProfile(userid)
    if ( profile.error !== undefined ) {
      logger.error({ userid }, "db/users/deleteProfile#ERROR_GETTING_PROFILE")
      return {
        error: profile.error,
        messages: undefined,
        profile: undefined,
      }
    }
    let messages = await getUserMessages(userid)
    if ( messages.error !== undefined ) {
      logger.error({ userid }, "db/users/deleteProfile#ERROR_GETTING_MESSAGES")
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
      logger.error({ userid }, "db/users/deleteProfile#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.deleteProfile",
        messages: undefined,
        profile: undefined,
      }
    }
    return {
      error: undefined,
      messages: messages.data,
      profile: profile.data,
    }
  }

export const getUserid = async (sessionid: string):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let sessionidCheckError = checkSessionid(sessionid)
    if ( sessionidCheckError !== undefined ) {
      logger.warn({ sessionid }, "db/users/getUserid#ERROR_ARGS_CHECK")
      return {
        error: sessionidCheckError,
        data: undefined,
      }
    }
    let sessionHash = hashSession(sessionid)
    let query = "SELECT userid, sessionid FROM sessions WHERE sessionid = $1"
    let result = await queryDatabase(query, [sessionHash])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ sessionid }, "db/users/getUserid#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getUserid",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.warn({ sessionid }, "db/users/getUserid#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.sessionNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0].userid as string
    }
  }
  
    

  
    
  

