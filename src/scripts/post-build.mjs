import { chmod } from "node:fs/promises"
import { join } from "node:path"

const __dirname = import.meta.dirname
const distpath = join(__dirname, "..", "..", "dist", "bin")

await chmod(join(distpath, "www.js"), 0o755)
await chmod(join(distpath, "ws.js"), 0o755)