import express from "express"
import cors from "cors"
import usersRoutes from "./routes/users"
import sessionsRoutes from "./routes/sessions"

const httpServer = express()

httpServer.use(cors())
httpServer.use(express.urlencoded({ extended: false }))
httpServer.use(express.json())

httpServer.use("/api/v1/users", usersRoutes)
httpServer.use("/api/v1/sessions", sessionsRoutes)

export default httpServer
