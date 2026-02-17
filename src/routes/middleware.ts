import { getSessionid } from "./miscs"
import logger from "../lib/logger"
import type { Request, Response, NextFunction } from "express"

export const verifyRequest = (req: Request, res: Response, next: NextFunction) => {
  let TAG = "httpServer/verifyRequest"
  let sessionid = getSessionid(req.header("Authorization"))
  if ( sessionid.error ) {
    logger.error(`${TAG}#WRONG_AUTH_HEADER`)
    res.status(401).json({ error: sessionid.error })
    return
  }
  req.sessionid = sessionid.data?.trim()
  next()
}

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  let TAG = "httpServer/notFound"
  logger.warn("httpServer/notFound")
  res.status(404).json({ error: "appError.wrongUrl" })
}

export const errorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
  logger.error({ error }, "httpServer/errorHandler")
  if ( res.headersSent ) {
    next(error)
    return
  }
  res.status(500).json({ error: "appError.unhandledError"})
}