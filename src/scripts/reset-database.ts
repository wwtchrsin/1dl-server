import { getClient } from "../lib/database/conn"
import { sql } from "../lib/database/schema"

let client: any

;(async () => {
  try {
    client = await getClient()
    await client.connect()
    await client.query(sql.resetTables)
    console.log("[DONE] Database successfully reset")
  } catch (err) {
    console.error("[ERROR] Impossible to reset database")
    console.error(err)
  } finally {
    client?.end()
  }
})()
