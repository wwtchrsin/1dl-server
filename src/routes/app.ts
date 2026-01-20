import { Router } from "express"
import { errorMessages } from "../lib/error-messages"
import type { Request, Response } from "express"

const getMessagesAction = async (req: Request, res: Response) => {
  let msgs = JSON.stringify(errorMessages)
  res.status(200).json({
    error: undefined,
    messages: msgs,
  })
}

const router = Router()

router.get("/messages", getMessagesAction)

export default router
