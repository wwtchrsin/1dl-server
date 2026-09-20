#!/usr/bin/env node

import app from "../http-server"
import env from "../lib/env"
import logger from "../lib/logger"

const port = env.http.port

app.listen(port, () => {
  logger.info(`1dl-project http server running on port ${port}`)
})


