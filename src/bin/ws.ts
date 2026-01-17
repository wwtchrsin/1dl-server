#!/usr/bin/env node

import wsServer from "../ws-server"
import env from "../lib/env"
import logger from "../lib/logger"

let port = env.ws.port + env.ws.instance

wsServer.listen(port)

logger.info(`1dl-project ws server #${env.ws.instance} running on port ${port}`)
