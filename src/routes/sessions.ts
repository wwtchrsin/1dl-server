import { Router } from "express"
import { createSession, deleteSession, getProfile } from "../lib/database/users"
import { checkUserCredentials } from "../lib/database/checkers"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readUserid } from "./miscs"
import type { Request, Response } from "express"
import type { Credentials } from "../lib/database/users"
import logger from "../lib/logger"

const createSessionAction = async (req: Request<Credentials>, res: Response) => {
  let TAG = "routes/sessions/createSession"
  let checkError = checkUserCredentials(req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.warn(req.body, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({ 
      error: getErrorMessage(checkError),
      session: undefined,
    })
    return
  }
  let result = await createSession(req.body)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)
    logger.warn(req.body, `${TAG}#ERROR_DB_QUERY`)    
    res.status(status).json({
      error: getErrorMessage(result.error),
      session: undefined,
    })
    return
  }
  logger.info(req.body, `${TAG}#DONE`)
  res.status(201).json({
    error: undefined,
    session: result.data,
  })
}

const deleteSessionAction = async (req: Request, res: Response) => {
  let TAG = "routes/sessions/deleteSession"
  let header = req.header("Authorization")
  let userid = await readUserid(header)
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.warn({ header }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(userid.error)
    })
    return
  }
  let error = await deleteSession(userid.data)
  if ( error !== undefined ) {
    let status = getStatusCode(error)
    logger.warn({ header }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(error)
    })
    return
  }
  logger.info({ header }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined
  })
}

const router = new Router()

router.post("/", createSessionAction)
router.delete("/", deleteSessionAction)

export default router
