import { Router } from "express"
import { createSession, deleteSession, getProfile } from "../lib/database/users"
import { getStatusCode, getErrorMessage } from "../lib/error-messages"
import { getAuthToken } from "./miscs"
import type { Request, Response } from "express"
import type { Credentials } from "../lib/database/users"

const createSessionAction = async (req: Request<Credentials>, res: Response) => {
  let result = await createSession(req.body)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)    
    res.status(status).json({ 
      error: getErrorMessage(result.error),
      session: undefined,
    })
    return
  }
  res.status(201).json({
    error: undefined,
    session: result.data,
  })
}

const deleteSessionAction = async (req: Request, res: Response) => {
  let token = getAuthToken(req.header("Authorization"))
  if ( token.error !== undefined ) {
    let status = getStatusCode(token.error)
    res.status(status).json({
      error: getErrorMessage(token.error)
    })
    return
  }
  let session = token.data
  let result = await deleteSession(session)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)
    res.status(status).json({
      error: getErrorMessage(result.error)
    })
    return
  }
  res.status(200).json({
    error: undefined
  })
}

const router = new Router()

router.post("/", createSessionAction)
router.delete("/", deleteSessionAction)

export default router
