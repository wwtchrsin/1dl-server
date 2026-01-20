import { Router } from "express"
import { createSession, deleteSession } from "../lib/database/users"
import { checkUserCredentials } from "../lib/database/checkers"
import { redactPassword } from "../lib/database/miscs"
import { getStatusCode, getAuthStatus } from "../lib/error-messages"
import { readUserid } from "./miscs"
import type { Request, Response } from "express"
import type { Credentials } from "../lib/database/interfaces"
import logger from "../lib/logger"

const createSessionAction = async (req: Request, res: Response) => {
  let TAG = "routes/sessions/createSession"
  let args = { credentials: redactPassword(req.body) }
  let checkError = checkUserCredentials(req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({ 
      error: checkError,
      session: undefined,
    })
    return
  }
  let result = await createSession(req.body as Credentials)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)    
    res.status(status).json({
      error: result.error,
      session: undefined,
    })
    return
  }
  logger.debug(args, `${TAG}#DONE`)
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
  logger.debug(`${TAG}#DONE`)
  res.status(200).json({
    error: undefined
  })
}

const router = Router()

router.post("/", createSessionAction)
router.delete("/", deleteSessionAction)

export default router
