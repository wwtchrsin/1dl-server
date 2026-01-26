import { Router } from "express"
import { errorMessages } from "../lib/error-messages"
import { limits } from "../lib/database/limits"
import type { Request, Response } from "express"

const getMessagesAction = async (req: Request, res: Response) => {
  res.status(200).json({
    error: undefined,
    messages: errorMessages,
  })
}

const getLimitsAction = async (req: Request, res: Response) => {
  res.status(200).json({
    error: undefined,
    limits: limits,
  })
}

const router = Router()

router.get("/messages", getMessagesAction)
router.get("/limits", getLimitsAction)

export default router
