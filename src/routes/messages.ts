import { Router } from "express"
import { createMessage, deleteMessage, getMessage, getMessages,
  getDistrictStats, getRegionStats } from "../lib/database/messages"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readProfile, readUserid } from "./miscs"
import type { Request, Response } from "express"
import type { MessageContent, Messageid, Roomid } from "../lib/database/messages"

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

const getMessageAction = async (req: Request, res: Response) => {
  let message = await getMessage(req.params)
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

const getMessagesAction = async (req: Request, res: Response) => {
  let messages = await getMessages(req.params)
  if ( messages.error !== undefined ) {
    let status = getStatusCode(messages.error)
    res.status(status).json({
      error: getErrorMessage(messages.error),
      message: undefined,
    })
    return
  }
  res.status(200).json({
    error: undefined,
    messages: messages.data,
  })
}

const getDistrictStatsAction = async (req: Request, res:  Response) => {
  let stats = await getDistrictStats(req.params)
  if ( stats.error !== undefined ) {
    let status = getStatusCode(stats.error)
    res.status(status).json({
      error: getErrorMessage(stats.error),
      rooms: undefined,
    })
    return
  }
  res.status(200).json({
    error: undefined,
    rooms: stats.data,
  })
}

const getRegionStatsAction = async (req: Request, res: Response) => {
  let stats = await getRegionStats(req.params?.region)
  if ( stats.error !== undefined ) {
    let status = getStatusCode(stats.error)
    res.status(status).json({
      error: getErrorMessage(stats.error),
      districts: undefined,
    })
    return
  }
  res.status(200).json({
    error: undefined,
    districts: stats.data,
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

router.get("/:region", getRegionStatsAction)
router.get("/:region/:district", getDistrictStatsAction)
router.get("/:region/:district/:room", getMessagesAction)
router.post("/:region/:district/:room/:index", createMessageAction)
router.get("/:region/:district/:room/:index", getMessageAction)
router.delete("/:region/:district/:room/:index", deleteMessageAction)

export default router

