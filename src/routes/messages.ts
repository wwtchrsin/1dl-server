import { Router } from "express"
import { createMessage, deleteMessage } from "../lib/database/messages"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readProfile, readUserid } from "./miscs"
import type { Request, Response } from "express"
import type { MessageContent, Messageid } from "../lib/database/messages"

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
  let message = await createMessage(profile.data.userid, req.params, req.body)
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
    message: message.data,
  })
}

const deleteMessageAction = async (req: Request, res: Response) => {
  let userid = await readUserid(req.header("Authorization"))
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    res.status(status).json({
      error: getErrorMessage(userid.error),
      message: undefined,
    })
    return
  }
  let message = await deleteMessage(userid.data, req.params)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    res.status(status).json({
      error: getErrorMessage(message.error),
      message: undefined,
    })
    return
  }
  res.status(200).json({
    error: undefined,
    message: message.data,
  })
}

const router = new Router()

router.post("/:region/:district/:room/:index", createMessageAction)
router.delete("/:region/:district/:room/:index", deleteMessageAction)

export default router

