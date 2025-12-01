import { Router } from "express"
import { createSession, deleteSession } from "../lib/database/users"
import { getStatusCode, getErrorMessage } from "../lib/error-messages"
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

const router = new Router()

router.post("/", createSessionAction)

export default router
