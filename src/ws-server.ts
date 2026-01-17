import { createServer } from "node:http"
import { WebSocketServer } from "ws"
import { onConnection } from "./lib/ws/client-messages"
import { enableConnCheck } from "./lib/ws/server-messages"
import { subscribeServer } from "./lib/ws/subscriptions"
import { readUserid } from "./routes/miscs"
import env from "./lib/env"

let httpServer = createServer()

let wsServer = new WebSocketServer({ noServer: true })

let pingTimerId = enableConnCheck(env.wsPingInterval)

httpServer.on("upgrade", async (request, socket, head) => {
  let header = request.headers["Authorization"] as string
  let userid = await readUserid(header)
  if ( userid.error !== undefined ) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
    socket.destroy()
    return
  }
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, userid.data)
  })
})

wsServer.on("connection", onConnection)

wsServer.on("close", () => clearInterval(pingTimerId))

subscribeServer()

export default httpServer


