import { rmSync, chmodSync } from "node:fs"
import { join } from "node:path"

const __dirname = import.meta.dirname
const distpath = join(__dirname, "..", "..", "dist")

chmodSync(join(distpath, "bin", "www.js"), 0o755)
chmodSync(join(distpath, "bin", "ws.js"), 0o755)