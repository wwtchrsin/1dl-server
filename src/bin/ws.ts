#!/usr/bin/env node

import wsServer from "../ws-server"
import env from "../lib/env"
import logger from "../lib/logger"

let port = env.ws.port

wsServer.listen(port)

logger.info(`1dl-project ws server running on port ${port}`)
