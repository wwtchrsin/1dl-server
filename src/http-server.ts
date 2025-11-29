import express from "express"
import cors from "cors"
import usersRoutes from "./routes/users"

const httpServer = express()

httpServer.use(cors())
httpServer.use(express.urlencoded({ extended: false }))
httpServer.use(express.json())

httpServer.use("/api/v1/users", usersRoutes)

export default httpServer
