import { createServer } from "node:http"
import { WebSocketServer } from "ws"
import { onConnection } from "./lib/ws/client-messages"
import { enableConnCheck } from "./lib/ws/server-messages"
import { subscribeServer } from "./lib/ws/subscriptions"
import env from "./lib/env"

let httpServer = createServer()

let wsServer = new WebSocketServer({ noServer: true })

let pingTimerId = enableConnCheck(env.ws.pingInterval)

httpServer.on("upgrade", async (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws)
  })
})

wsServer.on("connection", onConnection)

wsServer.on("close", () => clearInterval(pingTimerId))

subscribeServer()

export default httpServer


