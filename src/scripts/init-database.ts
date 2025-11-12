import { getClient } from "../lib/database/conn"
import { sql } from "../lib/database/schema"

let client: any

;(async () => {
  try {
    client = await getClient()
    await client.connect()
    await client.query(sql.createTables)
    console.log("[DONE] Database successfully initialized")
  } catch (err) {
    console.error("[ERROR] Impossible to initialize database")
    console.error(err)
  } finally {
    client?.end()
  }
})()
