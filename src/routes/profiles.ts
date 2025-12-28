import { Router } from "express"
import { createProfile, createSession, deleteProfile } from "../lib/database/users"
import { checkUserData } from "../lib/database/checkers"
import { redactPassword } from "../lib/database/miscs"
import * as redisCache from "../lib/redis/cache"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readUserid, redactProfile } from "./miscs"
import env from "../lib/env"
import type { Request, Response } from "express"
import type { UserData } from "../lib/database/interfaces"
import logger from "../lib/logger"

const createProfileAction = async (req: Request<UserData>, res: Response) => {
  let TAG = "routes/profiles/createProfile"
  let args = { userData: redactPassword(req.body) }
  let checkError = checkUserData(req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)    
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({ 
      error: getErrorMessage(checkError),
      session: undefined,
      profile: undefined,
    })
    return
  }
  let result = await createProfile(req.body, env.users.defaultState)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)    
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({ 
      error: getErrorMessage(result.error),
      session: undefined,
      profile: undefined,
    })
    return
  }
  let { login, password } = req.body
  let session = await createSession({ login, password })
  logger.debug(args, `${TAG}#DONE`)
  res.status(201).json({
    error: undefined,
    session: session.data,
    profile: redactProfile(result.data),
  })
}

const deleteProfileAction = async (req: Request, res: Response) => {
  let TAG = "routes/profiles/deleteProfile"
  let header = req.header("Authorization")
  let userid = await readUserid(header)
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.info(`${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: getErrorMessage(userid.error),
      user: undefined,
      messages: undefined,
    })
    return
  }
  let result = await deleteProfile(userid.data)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)
    logger.info(`${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(result.error),
      profile: undefined,
      messages: undefined,
    })
    return
  }
  await redisCache.changeRoomMsgcounts(result.messages, -1)
  await redisCache.changeDistrictMsgcounts(result.messages, -1)
  logger.debug(`${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    profile: redactProfile(result.profile),
    messages: result.messages,
  })
}

const router = new Router()

router.post("/", createProfileAction)
router.delete("/", deleteProfileAction)

export default router

