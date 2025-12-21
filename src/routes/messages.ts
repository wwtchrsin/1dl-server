import { Router } from "express"
import { createMessage, deleteMessage, getMessage, getMessages,
  getDistrictStats, getRegionStats } from "../lib/database/messages"
import { checkRegion, checkDistrictid, checkRoomid, checkMessageid,
  checkMessageData } from "../lib/database/checkers"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readProfile, readUserid } from "./miscs"
import type { Request, Response } from "express"
import type { MessageContent, Messageid, Roomid, Districtid } from "../lib/database/messages"

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
  let checkError = checkMessageData(profile.data.userid, req.params, req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
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
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
  let message = await getMessage(req.params as Messageid)
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
  let checkError = checkRoomid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
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

const getDistrictStatsAction = async (req: Request, res: Response) => {
  let checkError = checkDistrictid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
      rooms: undefined,
    })
    return
  }
  let stats = await getDistrictStats(req.params as Districtid)
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
  let region = req.params?.region
  let checkError = checkRegion(region)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
      districts: undefined,
    })
    return
  }
  let stats = await getRegionStats(region)
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
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
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

