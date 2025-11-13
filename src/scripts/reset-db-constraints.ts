import { getClient } from "../lib/database/conn"
import { sql } from "../lib/database/schema"

let client: any

;(async () => {
  try {
    client = await getClient()
    await client.connect()
    await client.query(sql.resetConstraints)
    console.log("[DONE] Database constraints successfully reset")
  } catch (err) {
    console.error("[ERROR] Impossible to reset database constraints")
    console.error(err)
  } finally {
    client?.end()
  }
})()
