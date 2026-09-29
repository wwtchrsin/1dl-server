#!/usr/bin/env node

import worker from "../worker"
import logger from "../lib/logger"
import env from "../lib/env"

worker().start(env.worker.interval)

logger.info(`1dl-project server worker started`)
