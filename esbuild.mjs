import { build } from "esbuild"
import { join } from "node:path"

let __dirname = import.meta.dirname

let srcDir = join(__dirname, "src", "bin")
let outDir = join(__dirname, "dist")

await build({
  entryPoints: [
    join(srcDir, "http.ts"),
    join(srcDir, "ws.ts"),
    join(srcDir, "dev.ts")
  ],
  outdir: outDir,
  platform: "node",
  format: "cjs",
  bundle: true,
  minify: false,
  sourcemap: true,
})
