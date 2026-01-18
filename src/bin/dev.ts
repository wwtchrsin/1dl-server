#!/usr/bin/env node

import app from "../http-server"
import wsServer from "../ws-server"
import env from "../lib/env"
import logger from "../lib/logger"

app.listen(env.http.port, () => {
  logger.info(`1dl-project http server running on port ${env.http.port}`)
})

wsServer.listen(env.ws.port)

logger.info(`1dl-project ws server running on port ${env.ws.port}`)
