import { Router } from "express"
import { createMessage } from "../lib/database/messages"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readProfile } from "./miscs"
import type { Request, Response } from "express"
import type { MessageContent } from "../lib/database/messages"

const createMessageAction = async (req: Request<MessageContent>, res: Response) => {
  let profile = await readProfile(req.header("Authorization"))
  if ( profile.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(profile.error))
    res.status(status).json({
      error: getErrorMessage(profile.error),
      message: undefined,
    })
    return
  }
  if ( profile.data.state !== "active" ) {
    res.status(403).json({
      error: getErrorMessage("appErrors.actionNotAllowed"),
      message: undefined,
    })
    return
  }
  let message = await createMessage(profile.data.userid, req.body)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    res.status(status).json({
      error: getErrorMessage(message.error),
      message: undefined,
    })
    return
  }
  res.status(201).json({
    error: undefined,
    message: message.data
  })
}

const router = new Router()

router.post("/", createMessageAction)

export default router

