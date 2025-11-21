process.env.PG_SCHEMA = "getMessageTest"

import { pool, queryDatabase } from "../conn"
import { getMessage } from "../messages"
import { createUser } from "../users"
import { sql } from "../schema"
import limits from "../limits"
import { databaseErrors, databaseConflicts } from "../../error-messages"
import { wrongValues } from "../../error-messages"

let userid = ""
let username = "abcd 123"
let useridPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

describe("testing database queries...", () => {
  beforeEach(async () => {
    await pool.query("DELETE FROM messages")
  })
  test("Function getMessage. Preparing database...", async () => {
    let args = {
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: username,
    }
    let result = await createUser(args)
    let table = await pool.query("SELECT userid FROM users")
    expect(result.error).toBeUndefined()
    expect(result.data).toBeDefined()
    expect(table).toBeDefined()
    expect(table.rows).toHaveLength(1)
    expect(table.rows[0].userid).toMatch(useridPattern)
    userid = table.rows[0].userid
  })
})
        
    
    
