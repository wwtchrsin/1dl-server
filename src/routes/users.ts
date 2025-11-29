import { Router } from "express"
import { createUser, createSession } from "../lib/database/users"
import { getStatusCode, getErrorMessage } from "../lib/error-messages"
import type { Request, Response } from "express"
import type { UserData } from "../lib/database/users"

const createUserAction = async (req: Request<UserData>, res: Response) => {
  let result = await createUser(req.body)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)    
    res.status(status).json({ 
      error: getErrorMessage(result.error),
      session: undefined,
      user: undefined,
    })
    return
  }
  let session = await createSession(result.data.userid)
  res.status(201).json({
    error: undefined,
    session: session.data,
    user: result.data,
  })
}

const router = new Router()

router.post("/", createUserAction)

export default router

