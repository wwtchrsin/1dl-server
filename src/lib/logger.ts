import pino from "pino"
import env from "./env"

const logger = pino({
  level: env.pinoLogLevel,
})

export default logger

