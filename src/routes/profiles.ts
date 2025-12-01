import { Router } from "express"
import { createProfile, createSession } from "../lib/database/users"
import { getStatusCode, getErrorMessage } from "../lib/error-messages"
import type { Request, Response } from "express"
import type { ProfileData } from "../lib/database/users"

const createProfileAction = async (req: Request<UserData>, res: Response) => {
  let result = await createProfile(req.body)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)    
    res.status(status).json({ 
      error: getErrorMessage(result.error),
      session: undefined,
      user: undefined,
    })
    return
  }
  let { login, password } = req.body as ProfileData
  let session = await createSession({ login, password })
  res.status(201).json({
    error: undefined,
    session: session.data,
    user: result.data,
  })
}

const router = new Router()

router.post("/", createProfileAction)

export default router

