import { randomUUID } from "node:crypto"
import { checkUserData, checkUserId } from "./checkers"
import { queryDatabase } from "./conn"
import { databaseErrors, databaseConflicts, errorsEqual } from "../error-messages"
import { hashPassword, getTimestamp } from "./miscs"
import type { TextResource } from "../langs"

export type UserData = {
  login: string,
  password: string,
  name: string,
}

export type CreatedUser = {
  userid: string,
  login: string,
  name: string,
  state: string,
  publicid: string,
  timestamp: string,
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


export const createUser = async(req: string):
  Promise<{ error: TextResource | undefined, data: CreatedUser | undefined }> => {
    let errorMessage = checkUserData(req)
    if ( errorMessage !== undefined ) {
      return {
        error: errorMessage,
        data: undefined,
      }
    }
    let { login, password, name } = req as UserData
    let checkResult = await loginExists(login)
    if ( checkResult.error !== undefined ) {
      return {
        error: checkResult.error,
        data: undefined,
      }
    }
    if ( checkResult.data !== false ) {
      return {
        error: databaseConflicts.loginTaken,
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
      return {
        error: databaseErrors.createUser,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result!.rows![0] as CreatedUser,
    }
  }

export const deleteSession = async (userid: string): 
  Promise<{ error: TextResource | undefined, data: string | undefined }> => {
    let useridCheckError = checkUserId(userid)
    if ( useridCheckError !== undefined ) {
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let query = "DELETE FROM sessions WHERE userid = $1 RETURNING sessionid"
    let result = await queryDatabase(query, [userid])
    if ( !result?.rows || result.rows.length > 1 ) {
      return {
        error: databaseErrors.deleteSession,
        data: undefined,
      }
    }
    if ( result.rows.length === 0 ) {
      return {
        error: databaseConflicts.sessionNotFound,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: result.rows[0].sessionid,
    }
  }

export const createSession = async (userid: string): 
  Promise<{ error: TextResource | undefined, data: string | undefined }> => {
    let useridCheckError = checkUserId(userid)
    if ( useridCheckError !== undefined ) {
      return {
        error: useridCheckError,
        data: undefined,
      }
    }
    let delres = await deleteSession(userid)
    if ( delres.error !== undefined && !errorsEqual(delres.error, 
      databaseConflicts.sessionNotFound) ) {
        return {
          error: delres.error,
          data: undefined,
        }
      }
    let sessionid = randomUUID()
    let query = "INSERT INTO sessions VALUES($1, $2, $3) RETURNING *"
    let queryParams = [userid, sessionid, getTimestamp()]
    let result = await queryDatabase(query, queryParams)
    if ( result?.rows?.length !== 1 ) {
      return {
        error: databaseErrors.createSession,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: sessionid,
    }
  }
    
    

  
    
  

