const env = {
  mode: process.env.NODE_ENV ?? "dev",
  http: {
    port: Number(process.env.HTTP_PORT ?? "3000"),
    instance: Number(process.env.HTTP_INSTANCE ?? "0"),
  },
  ws: {
    port: Number(process.env.WS_PORT ?? "8080"),
    pingInterval: Number(process.env.WS_PING_INTERVAL ?? "30000"),
    instance: Number(process.env.WS_INSTANCE ?? "0"),
  },
  pg: {
    user: process.env.PG_USER ?? "admin",
    password: process.env.PG_PASSWORD,
    host: process.env.PG_HOST ?? "localhost",
    port: Number(process.env.PG_PORT ?? "5432"),
    database: process.env.PG_DBNAME,
    schema: process.env.PG_SCHEMA ?? "public",
  },
  redis: {
    username: process.env.REDIS_USERNAME ?? "default",
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? "6379"),
    database: Number(process.env.REDIS_DATABASE ?? "0"),
    namespace: process.env.REDIS_NAMESPACE ?? "1dl",
  },
  hashSalt: process.env.HASH_SALT ?? "",
  serviceid: process.env.SERVICE_ID ?? "",
  pinoLogLevel: process.env.PINO_LOGLEVEL ?? "error",
  users: {
    defaultState: process.env.USER_DEFAULT_STATE ?? "active",
  }
}

if ( isNaN(env.http.port) || isNaN(env.http.instance) || isNaN(env.ws.port) ||
  isNaN(env.ws.instance) || isNaN(env.pg.port) || isNaN(env.redis.port) ) {
    console.error("Error: Incorrect environment variables. Exit.")
    process.exit(1)
  }

export default env
