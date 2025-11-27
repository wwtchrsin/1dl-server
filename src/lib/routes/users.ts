import { Router } from "express"
import { createUser, createSession } from "../database/users"
import type { Request, Response } from "express"
import type { UserData } from "../database/users"

const createUserAction = async (req: Request<UserData>, res: Response) => {
  let result = await createUser(req.body)
  if ( result.error !== undefined ) {
    res.json({ 
      error: result.error,
      session: undefined,
      user: undefined,
    })
    return
  }
  let session = await createSession(result.data.userid)
  if ( session.error !== undefined ) {
    res.json({
      error: session.error,
      session: undefined,
      user: undefined,
    })
    return
  }
  res.json({
    error: undefined,
    session: session.data,
    user: result.data,
  })
}

const rounter = new Router()

router.post("/", createUserAction)

export default router


