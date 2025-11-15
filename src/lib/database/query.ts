import type { Result } from "pg"
import { pool } from "./conn"

export const queryDatabase = async (queryString: string, queryParams: string[]):
  Promise<Result | undefined> => {
    try {
      let result = await pool.query(queryString, queryParams)
      return result
    } catch (err) {
      return undefined
    }
  }
