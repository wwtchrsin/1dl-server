import { Router } from "express"
import { createSession, deleteSession, getProfile } from "../lib/database/users"
import { getStatusCode, getErrorMessage } from "../lib/error-messages"
import { getPrivateUserid } from "./miscs"
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
  let authResult = await getPrivateUserid(req.header("Authorization"))
  if ( authResult.error !== undefined ) {
    let status = getStatusCode(authResult.error)
    res.status(status).json({
      error: getErrorMessage(authResult.error)
    })
    return
  }
  let error = await deleteSession(authResult.data)
  if ( error !== undefined ) {
    let status = getStatusCode(error)
    res.status(status).json({
      error: getErrorMessage(error)
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
