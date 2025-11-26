import pino from "pino"
import env from "./env"

const logger = pino({
  level: env.pinoLogLevel,
  base: undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: ["password", "token", "sessionid", "userid"],
})

export default logger
