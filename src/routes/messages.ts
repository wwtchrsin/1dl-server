import { Router } from "express"
import { createMessage, deleteMessage, getMessage, getMessages,
  countDistrictMessages, countRegionMessages } from "../lib/database/messages"
import { checkRegion, checkDistrictid, checkRoomid, checkMessageid,
  checkMessageData } from "../lib/database/checkers"
import * as redisCache from "../lib/redis/cache"
import { getStatusCode, getAuthStatus, getErrorMessage } from "../lib/error-messages"
import { readProfile, readUserid } from "./miscs"
import logger from "../lib/logger"
import type { Request, Response } from "express"
import type { Messageid, Roomid, Districtid } from "../lib/database/interfaces"

const createMessageAction = async (req: Request<Messageid>, res: Response) => {
  let TAG = "routes/messages/createMessage"
  let args = { messageid: req.params, content: req.body }
  let profile = await readProfile(req.header("Authorization"))
  if ( profile.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(profile.error))
    logger.info(args, `${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: getErrorMessage(profile.error),
      message: undefined,
    })
    return
  }
  if ( profile.data.state !== "active" ) {
    logger.info(args, `${TAG}#ERROR_PERMISSIONS`)
    res.status(403).json({
      error: getErrorMessage("appErrors.actionNotAllowed"),
      message: undefined,
    })
    return
  }
  let checkError = checkMessageData(profile.data.userid, req.params, req.body)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info(args, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
  let message = await createMessage(profile.data.userid, req.params, req.body)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info(args, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(message.error),
      message: undefined,
    })
    return
  }
  await redisCache.changeRoomMsgcount(req.params, 1)
  await redisCache.changeDistrictMsgcount(req.params, 1)
  logger.debug(args, `${TAG}#DONE`)
  res.status(201).json({
    error: undefined,
    message: message.data,
  })
}

const getMessageAction = async (req: Request, res: Response) => {
  let TAG = "routes/messages/getMessage"
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
  let message = await getMessage(req.params as Messageid)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(message.error),
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

const getMessagesAction = async (req: Request, res: Response) => {
  let TAG = "routes/messages/getMessages"
  let checkError = checkRoomid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ roomid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
  let messages = await getMessages(req.params as Roomid)
  if ( messages.error !== undefined ) {
    let status = getStatusCode(messages.error)
    logger.info({ roomid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(messages.error),
      message: undefined,
    })
    return
  }
  logger.debug({ roomid: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    messages: messages.data,
  })
}

const getDistrictStatsAction = async (req: Request, res: Response) => {
  let TAG = "routes/messages/getDistrictStats"
  let checkError = checkDistrictid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ districtid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      msgcounts: undefined,
    })
    return
  }
  let { region, district } = req.params as Districtid
  let cache = await redisCache.getRoomMsgcounts({ region, district })
  if ( cache.data ) {
    logger.debug({ districtid: req.params }, `${TAG}#CACHED_VALUE_RETURNED`)
    res.status(200).json({
      error: undefined,
      msgcounts: cache.data,
    })
    return
  }
  let msgcounts = await countDistrictMessages({ region, district })
  if ( msgcounts.error !== undefined ) {
    let status = getStatusCode(msgcounts.error)
    logger.info({ districtid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(msgcounts.error),
      msgcounts: undefined,
    })
    return
  }
  await redisCache.updateRoomMsgcounts({ region, district }, msgcounts.data)
  logger.debug({ districtid: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    msgcounts: msgcounts.data,
  })
}

const getRegionStatsAction = async (req: Request, res: Response) => {
  let TAG = "routes/messages/getRegionStats"
  let region = req.params?.region
  let checkError = checkRegion(region)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ region }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      districts: undefined,
    })
    return
  }
  let cache = await redisCache.getDistrictMsgcounts(region)
  if ( cache.data ) {
    logger.debug({ region }, `${TAG}#CACHED_VALUE_RETURNED`)
    res.status(200).json({
      error: undefined,
      msgcounts: cache.data,
    })
    return
  }
  let msgcounts = await countRegionMessages(region)
  if ( msgcounts.error !== undefined ) {
    let status = getStatusCode(msgcounts.error)
    logger.info({ region }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(msgcounts.error),
      districts: undefined,
    })
    return
  }
  await redisCache.updateDistrictMsgcounts(region, msgcounts.data)
  logger.debug({ region }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    msgcounts: msgcounts.data,
  })
}

const deleteMessageAction = async (req: Request, res: Response) => {
  let TAG = "routes/messages/deleteMessage"
  let checkError = checkMessageid(req.params)
  if ( checkError !== undefined ) {
    let status = getStatusCode(checkError)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_ARGS_CHECK`)
    res.status(status).json({
      error: getErrorMessage(checkError),
      message: undefined,
    })
    return
  }
  let userid = await readUserid(req.header("Authorization"))
  if ( userid.error !== undefined ) {
    let status = getAuthStatus(getStatusCode(userid.error))
    logger.info({ messageid: req.params }, `${TAG}#ERROR_AUTHORIZATION`)
    res.status(status).json({
      error: getErrorMessage(userid.error),
      message: undefined,
    })
    return
  }
  let message = await deleteMessage(userid.data, req.params as Messageid)
  if ( message.error !== undefined ) {
    let status = getStatusCode(message.error)
    logger.info({ messageid: req.params }, `${TAG}#ERROR_DB_QUERY`)
    res.status(status).json({
      error: getErrorMessage(message.error),
      message: undefined,
    })
    return
  }
  await redisCache.changeRoomMsgcount(req.params as Messageid, -1)
  await redisCache.changeDistrictMsgcount(req.params as Messageid, -1)
  logger.debug({ messageid: req.params }, `${TAG}#DONE`)
  res.status(200).json({
    error: undefined,
    message: message.data,
  })
}

const router = Router()

router.get("/:region", getRegionStatsAction)
router.get("/:region/:district", getDistrictStatsAction)
router.get("/:region/:district/:room", getMessagesAction)
router.post("/:region/:district/:room/:index", createMessageAction)
router.get("/:region/:district/:room/:index", getMessageAction)
router.delete("/:region/:district/:room/:index", deleteMessageAction)

export default router

