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