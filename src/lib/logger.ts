import pino from "pino"
import env from "./env"

const logger = pino({
  level: env.pinoLogLevel,
  base: undefined,
  redact: ["password", "token", "sessionid", "userid"],
})

export default logger
