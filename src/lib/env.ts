import "dotenv/config"

const env = {
  httpPort: Number(process.env.HTTP_PORT ?? "3000"),
  wsPort: Number(process.env.WS_PORT ?? "8080"),
  pg: {
    user: process.env.PG_USER ?? "admin",
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST ?? "http://127.0.0.1",
    port: Number(process.env.PG_PORT ?? "5432"),
    database: process.env.PG_DBNAME,
    schema: process.env.PG_SCHEMA ?? "public",
  },
  redis: {
    user: process.env.REDIS_USER ?? "default",
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST ?? "http://127.0.0.1",
    port: Number(process.env.REDIS_PORT ?? "6379"),
    namespace: process.env.REDIS_NAMESPACE ?? "1dl",
  },
  passwordSalt: process.env.PASSWORD_SALT ?? "",
  pinoLogLevel: process.env.PINO_LOGLEVEL ?? "error",
}

if ( isNaN(env.httpPort) || isNaN(env.wsPort) || isNaN(env.pg.port) ||
  isNaN(env.redis.port) ) {
    console.error("Error: Incorrect environment variables. Exit.")
    process.exit(1)
  }

export default env
