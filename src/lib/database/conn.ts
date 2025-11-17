import { Client, Pool } from "pg"
import type { Result } from "pg"
import env from "../env"


export const pool = new Pool({
  user: env.pg.user,
  password: env.pg.password,
  host: env.pg.host,
  port: env.pg.port,
  database: env.pg.database,
  max: 20,
})

export const getClient = async () => {
  return new Client({
    user: env.pg.user,
    password: env.pg.password,
    host: env.pg.host,
    port: env.pg.port,
    database: env.pg.database,
  })
}

export const queryDatabase = async (queryString: string, queryParams: string[]):
  Promise<Result | undefined> => {
    try {
      let result = await pool.query(queryString, queryParams)
      return result
    } catch (err) {
      return undefined
    }
  }
