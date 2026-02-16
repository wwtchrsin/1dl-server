import { randomBytes } from "node:crypto"
import { Client, Pool } from "pg"
import type { Result } from "pg"
import env from "../env"
import logger from "../logger"

export const schema = (() => {
  if ( env.mode !== "test" ) return env.pg.schema
  return "_" + randomBytes(12).toString("hex")
})()

export const pool = new Pool({
  user: env.pg.user,
  password: env.pg.password,
  host: env.pg.host,
  port: env.pg.port,
  database: env.pg.database,
  max: 20,
  options: `--search_path=${schema}`,
})

export const getClient = async () => {
  return new Client({
    user: env.pg.user,
    password: env.pg.password,
    host: env.pg.host,
    port: env.pg.port,
    database: env.pg.database,
    options: `--search_path=${schema}`,
  })
}

export const queryDatabase = async (queryString: string, queryParams: (string | number)[] = []):
  Promise<Result | undefined> => {
    try {
      let result = await pool.query(queryString, queryParams)
      return result
    } catch (err) {
      let errmsg = {
        query: queryString,
        params: queryParams?.length ?? 0,
        stack: err.stack,
        message: err.message,
      }
      logger.error(errmsg, "db/conn/queryDatabase#ERROR")
      return undefined
    }
  }

export const executeTransaction = async (queryString: string): Promise<boolean> => {
  let client: Client | undefined
  try {
    client = await pool.connect()
    await client!.query("BEGIN")
    await client!.query(queryString)
    await client!.query("COMMIT")
    return true
  } catch (err) {
    if ( client !== undefined ) {
      try { 
        await client.query("ROLLBACK") 
      } catch (err) {
        let errmsg = {
          stack: err.stack,
          message: err.message,
        }
        logger.error(errmsg, "db/conn/executeTransaction#ROLLBACK_ERROR")
      }
    }
    let errmsg = {
      stack: err.stack,
      message: err.message,
    }
    logger.error(errmsg, "db/conn/executeTransaction#ERROR")
    return false
  } finally {
    client?.release()
  }
}

