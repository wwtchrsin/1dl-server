import { Router } from "express"
import { createProfile, createSession, deleteProfile } from "../lib/database/users"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readUserid, redactProfile } from "./miscs"
import env from "../lib/env"
import type { Request, Response } from "express"
import type { ProfileData } from "../lib/database/users"

const createProfileAction = async (req: Request<UserData>, res: Response) => {
  let result = await createProfile(req.body, env.users.defaultState)
  if ( result.error !== undefined ) {
    let status = getStatusCode(result.error)    
    res.status(status).json({ 
      error: getErrorMessage(result.error),
      session: undefined,
      profile: undefined,
    })
    return
  }
  let { login, password } = req.body as ProfileData
  let session = await createSession({ login, password })
  res.status(201).json({
    error: undefined,
    session: session.data,
    profile: redactProfile(result.data),
  })
}

const deleteProfileAction = async (req: Request, res: Response) => {
  let userid = await readUserid(req.header("Authorization"))
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
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
    res.status(status).json({
      error: getErrorMessage(result.error),
      profile: undefined,
      messages: undefined,
    })
    return
  }
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

