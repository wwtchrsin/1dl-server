import { Router } from "express"
import { verifyRequest } from "./middleware"
import { createProfile, createSession, deleteProfile } from "../lib/database/users"
import { checkUserData, checkIdentifier } from "../lib/database/checkers"
import { redactPassword } from "../lib/database/miscs"
import * as redisCache from "../lib/redis/cache"
import { publish } from "../lib/redis/conn"
import { getStatusCode, getAuthStatus } from "../lib/error-messages"
import { readProfile, readUserid, redactProfile, extractMessageids } from "./miscs"
import env from "../lib/env"
import type { Request, Response } from "express"
import type { UserData } from "../lib/database/interfaces"
import logger from "../lib/logger"

const createProfileAction = async (req: Request, res: Response) => {
  let TAG = "routes/profiles/createProfile"
  let args = { userData: redactPassword(req.body) }
  let userDataError = checkUserData(req.body)
  let identifierError = checkIdentifier(req.body?.identifier)
  let checkError = userDataError || identifierError
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)    
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({ 
      error: checkError,
      sessionid: undefined,
      profile: undefined,
    })
    return
  }
  let profile = await createProfile(req.body as UserData, env.users.defaultState)
  if ( profile.error !== undefined ) {
    let status = getStatusCode(profile.error)    
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({ 
      error: profile.error,
      sessionid: undefined,
      profile: undefined,
    })
    return
  }
  let session = await createSession(profile.data!.userid, req.body.identifier!)
  logger.debug(args, `${TAG}#DONE`)
  res.status(201).json({
    error: undefined,
    sessionid: session.sessionid,
    profile: redactProfile(profile.data),
  })
}

const getProfileAction = async (req: Request, res: Response) => {
  let TAG = "routes/profiles/getProfile"
  let profile = await readProfile(req.sessionid)
  if ( profile.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(profile.error))
    logger.info(`${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: profile.error,
      profile: undefined,
    })
    return
  }
  logger.debug(`${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    profile: redactProfile(profile.data),
  })
}

const deleteProfileAction = async (req: Request, res: Response) => {
  let TAG = "routes/profiles/deleteProfile"
  let userid = await readUserid(req.sessionid)
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.info(`${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: userid.error,
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
      error: result.error,
      profile: undefined,
      messages: undefined,
    })
    return
  }
  let messageids = extractMessageids(result.messages)
  await redisCache.changeZoneMsgcounts(result.messages, -1)
  await redisCache.changeDistrictMsgcounts(result.messages, -1)
  await publish("messages:deleted", { messageids })
  await publish("sessions:deleted", { userids: [userid.data] })
  logger.debug(`${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    profile: redactProfile(result.profile),
    messages: result.messages,
  })
}

const router = Router()

router.use(verifyRequest)
router.get("/", getProfileAction)
router.post("/", createProfileAction)
router.delete("/", deleteProfileAction)

export default router

