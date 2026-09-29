import { build } from "esbuild"
import { join } from "node:path"

let __dirname = import.meta.dirname

let tasks = [
  { 
    outDir: join(__dirname, "dist"),
    entryPoints: [
      join(__dirname, "src", "bin", "http.ts"),
      join(__dirname, "src", "bin", "ws.ts"),
      join(__dirname, "src", "bin", "dev.ts"),
      join(__dirname, "src", "bin", "worker.ts"),
    ]
  },
  {
    outDir: join(__dirname, "scripts"),
    entryPoints: [
      join(__dirname, "src", "scripts", "init-database.ts"),
      join(__dirname, "src", "scripts", "query-database.ts"),
      join(__dirname, "src", "scripts", "reset-database.ts"),
      join(__dirname, "src", "scripts", "reset-redis.ts")
    ]
  },
]

for ( let task of tasks ) {
  await build({
    entryPoints: task.entryPoints,
    outdir: task.outDir,
    platform: "node",
    format: "cjs",
    bundle: true,
    minify: false,
    sourcemap: true,
  })
}



