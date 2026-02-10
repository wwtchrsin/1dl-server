import express from "express"
import cors from "cors"
import profilesRouter from "./routes/profiles"
import sessionsRouter from "./routes/sessions"
import messagesRouter from "./routes/messages"
import appDataRouter from "./routes/app"
import { verifyRequest } from "./routes/middleware"

const httpServer = express()

httpServer.use(cors())
httpServer.use(express.urlencoded({ extended: false }))
httpServer.use(express.json())

httpServer.use(verifyRequest)
httpServer.use("/api/v1/profiles", profilesRouter)
httpServer.use("/api/v1/sessions", sessionsRouter)
httpServer.use("/api/v1/messages", messagesRouter)
httpServer.use("/api/v1/app", appDataRouter)

export default httpServer
