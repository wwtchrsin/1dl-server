import { randomUUID } from "node:crypto"
import { checkUserData, checkUserId, checkSessionId, checkUserCredentials } from "./checkers"
import { queryDatabase } from "./conn"
import { databaseErrors, databaseConflicts } from "../error-messages"
import { hashPassword, getTimestamp } from "./miscs"
import logger from "../logger"

export type UserData = {
  login: string,
  password: string,
  name: string,
}

export type User = {
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

export const createUser = async(req: any):
  Promise<{ error: string | undefined, data: User | undefined }> => {
    let errorMessage = checkUserData(req)
    if ( errorMessage !== undefined ) {
      logger.warn({ req }, "db/users/createUser#ERROR_ARGS_CHECK")
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { login, password, name } = req as UserData
    let checkResult = await loginExists(login)
    if ( checkResult.error !== undefined ) {
      logger.error({ req }, "db/users/createUser#ERROR_LOGIN_CHECK")
      return {
        error: checkResult.error,
        data: undefined,
      }
    }
    if ( checkResult.data !== false ) {
      logger.warn({ req }, "db/users/createUser#ERROR_LOGIN_TAKEN")
      return {
        error: "databaseConflicts.loginTaken",
        data: undefined,
      }
    }
    let state = "inactive"
    let userid = randomUUID()
    let puid = randomUUID()
    let passwordHash = hashPassword(login, password)
    let query = `
      INSERT INTO users VALUES
        ($1, $2, $3, $4, $5, $6, $7)
        RETURNING userid, login, name, state, puid, timestamp
    `
    let queryParams = [userid, login, passwordHash, name, state, puid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      logger.error({ req }, "db/users/createUser#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.createUser",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result!.rows![0] as User,
    }
  }

export const deleteSession = async (sessionid: string): 
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let sessionidCheckError = checkSessionId(sessionid)
    if ( sessionidCheckError !== undefined ) {
      logger.warn({ sessionid }, "db/users/deleteSession#ERROR_ARGS_CHECK")
      return {
        error: sessionidCheckError,
        data: undefined,
      }
    }
    let query = "DELETE FROM sessions WHERE sessionid = $1 RETURNING userid"
    let result = await queryDatabase(query, [sessionid])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ sessionid }, "db/users/deleteSession#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.deleteSession",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.warn({ sessionid }, "db/users/deleteSession#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.sessionNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0].userid,
    }
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
    let checkQuery = `
      SELECT users.userid as userid, sessions.sessionid as sessionid
        FROM users LEFT JOIN sessions ON users.userid = sessions.userid
        WHERE users.login = $1 AND users.password = $2
    `
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
        error: "databaseConflicts.userNotFound",
        data: undefined,
      }
    }
    if ( typeof checkResult.rows[0].sessionid === "string" ) {
      return {
        error: undefined,
        data: checkResult.rows[0].sessionid,
      }
    }
    let { userid } = checkResult.rows[0]
    let sessionid = randomUUID()
    let query = "INSERT INTO sessions VALUES($1, $2, $3) RETURNING *"
    let queryParams = [userid, sessionid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
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

export const getUserBySessionId = async (sessionid: string): 
  Promise<{ error: string | undefined, data: User | undefined }> => {
    let sessionidCheckError = checkSessionId(sessionid)
    if ( sessionidCheckError !== undefined ) {
      logger.warn({ sessionid }, "db/users/getUserBySessionId#ERROR_ARGS_CHECK")
      return {
        error: sessionidCheckError,
        data: undefined,
      }
    }
    let query = `
      SELECT users.userid as userid, login, name, 
        state, puid, users.timestamp as timestamp
        FROM users, sessions WHERE
          sessions.userid = users.userid AND
          sessions.sessionid = $1
    `
    let result = await queryDatabase(query, [sessionid])
    if ( !result?.rows || result.rows.length > 1 ) {
      logger.error({ sessionid }, "db/users/getUserBySessionId#ERROR_DB_QUERY")
      return {
        error: "databaseErrors.getUserBySessionId",
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      logger.warn({ sessionid }, "db/users/getUserBySessionId#ERROR_NOT_FOUND")
      return {
        error: "databaseConflicts.userNotFound",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0] as User,
    }
  }

  
    
  

