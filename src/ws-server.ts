import { createServer } from "node:http"
import { parse } from "node:url"
import { WebSocketServer } from "ws"
import { onConnection } from "./lib/ws/client-messages"
import { enableConnCheck } from "./lib/ws/server-messages"
import { subscribeServer } from "./lib/ws/subscriptions"
import { getProfile } from "./lib/database/users"
import { verifyToken } from "./routes/miscs"
import env from "./lib/env"

let httpServer = createServer()

let wsServer = new WebSocketServer({ noServer: true })

let pingTimerId = enableConnCheck(env.ws.pingInterval)

httpServer.on("upgrade", async (request, socket, head) => {
  let { query } = parse(request.url, true)
  let session = await verifyToken(query)
  if ( session.error || !session.userid ) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
    socket.destroy()
    return
  }
  let profile = await getProfile(session.userid)
  if ( profile.error || profile.data?.state !== "active" ) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n")
    socket.destroy()
    return
  }
  wsServer.handleUpgrade(request, socket, head, (ws) => {
    wsServer.emit("connection", ws, session.userid!)
  })
})

wsServer.on("connection", onConnection)

wsServer.on("close", () => clearInterval(pingTimerId))

subscribeServer()

export default httpServer


