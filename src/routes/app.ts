import { Router } from "express"
import { errorMessages } from "../lib/error-messages"
import type { Request, Response } from "express"

const getMessagesAction = async (req: Request, res: Response) => {
  res.status(200).json({
    error: undefined,
    messages: errorMessages,
  })
}

const router = Router()

router.get("/messages", getMessagesAction)

export default router
