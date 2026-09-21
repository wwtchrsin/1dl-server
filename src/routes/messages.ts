import { Router } from "express"
import { verifyRequest } from "./middleware"
import { createMessage, deleteMessage, getMessage, getMessages } from "../lib/database/messages"
import { checkMessageid, checkMessageData, checkLocation } from "../lib/database/checkers"
import { publish } from "../lib/redis/conn"
import { getStatusCode, getAuthStatus } from "../lib/error-messages"
import { readProfile, readUserid, completeMessage,
  extractMessageids } from "./miscs"
import logger from "../lib/logger"
import type { Request, Response } from "express"
import type { Messageid, Location } from "../lib/database/interfaces"

const createMessageAction = async (req: Request<Messageid>, res: Response) => {
  let TAG = "routes/messages/createMessage"
  let args = { messageid: req.params, content: req.body }
  let profile = await readProfile(req.sessionid)
  if ( profile.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(profile.error))
    logger.info(args, `${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: profile.error,
      message: undefined,
    })
    return
  }
  let checkError = checkMessageData(profile.data.userid, req.params, req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: checkError,
      message: undefined,
    })
    return
  }
  let { region } = req.params as Messageid
  if ( profile.data.state !== "active" || profile.data.region !== region ) {
    logger.info(args, `${TAG}#ERROR_PERMISSIONS`)
    res.status(403).json({
      error: "appError.actionNotAllowed",
      message: undefined,
    })
    return
  }
  let message = await createMessage(profile.data.userid, req.params, req.body)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: message.error,
      message: undefined,
    })
    return
  }
  let msg = completeMessage(message.data, profile.data)
  await publish("messages:created", { messages: [msg] })
  logger.debug(args, `${TAG}#DONE`)
  res.status(201).json({
    error: undefined,
    message: message.data,
  })
}

const getMessageAction = async (req: Request<Messageid>, res: Response) => {
  let TAG = "routes/messages/getMessage"
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: checkError,
      message: undefined,
    })
    return
  }
  let message = await getMessage(req.params as Messageid)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: message.error,
      message: undefined,
    })
    return
  }
  logger.debug({ messageid: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    message: message.data,
  })
}

const getMessagesAction = async (req: Request<Location>, res: Response) => {
  let TAG = "routes/messages/getMessages"
  let checkError = checkLocation(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ location: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: checkError,
      message: undefined,
    })
    return
  }
  let messages = await getMessages(req.params as Location)
  if ( messages.error !== undefined ) {
    let status = getStatusCode(messages.error)
    logger.info({ location: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: messages.error,
      message: undefined,
    })
    return
  }
  logger.debug({ location: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    messages: messages.data,
  })
}

const deleteMessageAction = async (req: Request<Messageid>, res: Response) => {
  let TAG = "routes/messages/deleteMessage"
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: checkError,
      message: undefined,
    })
    return
  }
  let userid = await readUserid(req.sessionid)
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.info({ messageid: req.params }, `${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: userid.error,
      message: undefined,
    })
    return
  }
  let message = await deleteMessage(userid.data, req.params as Messageid)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: message.error,
      message: undefined,
    })
    return
  }
  let messageids = extractMessageids([req.params as Messageid])
  await publish("messages:deleted", { messageids })
  logger.debug({ messageid: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    message: message.data,
  })
}

const router = Router()

router.use(verifyRequest)
router.get("/:region/:tag", getMessagesAction)
router.post("/:region/:tag/:index", createMessageAction)
router.get("/:region/:tag/:index", getMessageAction)
router.delete("/:region/:tag/:index", deleteMessageAction)

export default router

