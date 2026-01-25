import { Router } from "express"
import { createSession, deleteSession, getProfile } from "../lib/database/users"
import { checkUserCredentials } from "../lib/database/checkers"
import { redactPassword } from "../lib/database/miscs"
import { publish } from "../lib/redis/conn"
import { getStatusCode, getAuthStatus } from "../lib/error-messages"
import { readUserid, redactProfile } from "./miscs"
import type { Request, Response } from "express"
import type { Credentials } from "../lib/database/interfaces"
import logger from "../lib/logger"

const createSessionAction = async (req: Request, res: Response) => {
  let TAG = "routes/sessions/createSession"
  let args = { args: redactPassword(req.body) }
  let checkError = checkUserCredentials(req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({ 
      error: checkError,
      session: undefined,
      prfile: undefined,
    })
    return
  }
  let session = await createSession(req.body as Credentials)
  if ( session.error !== undefined ) {
    let status = getStatusCode(session.error)
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)    
    res.status(status).json({
      error: session.error,
      session: undefined,
      profile: undefined,
    })
    return
  }
  if ( req.body?.profile !== true ) {
    logger.debug(args, `${TAG}#DONE`)
    res.status(201).json({
      error: undefined,
      session: session.sessionid,
      profile: undefined,
    })
    return
  }
  let profile = await getProfile(session.userid)
  if ( profile.error ) {
    let status = getStatusCode(profile.error)
    logger.info(args, `${TAG}#ERROR_PROFILE_QUERY`)
    res.status(status).json({
      error: profile.error,
      session: undefined,
      profile: undefined,
    })
    return
  }
  logger.debug(args, `${TAG}#PROFILE_SENT`)
  res.status(201).json({
    error: undefined,
    session: session.sessionid,
    profile: redactProfile(profile.data),
  })
}

const deleteSessionAction = async (req: Request, res: Response) => {
  let TAG = "routes/sessions/deleteSession"
  let header = req.header("Authorization")
  let userid = await readUserid(header)
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.info(`${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: userid.error
    })
    return
  }
  let error = await deleteSession(userid.data)
  if ( error !== undefined ) {
    let status = getStatusCode(error)
    logger.info(`${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({ error })
    return
  }
  await publish("sessions:deleted", { userids: [userid.data] })
  logger.debug(`${TAG}#DONE`)
  res.status(200).json({
    error: undefined
  })
}

const router = Router()

router.post("/", createSessionAction)
router.delete("/", deleteSessionAction)

export default router
