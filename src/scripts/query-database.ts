import readline from "node:readline"
import { getClient } from "../lib/database/conn"

let ioInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

let readLine = (prompt: string) => {
  return new Promise((res) => {
    ioInterface.question(prompt, res)
  })
}

;(async () => {
  let pgClient: any
  try {
    pgClient = await getClient()
    await pgClient.connect()
    console.log("Quering the Postgres Database: ")
    while (true) {
      let line = (await readLine(" > ")) as string
      if ( line.length === 0 ) {
        console.log("DONE")
        break
      }
      let result = await pgClient.query(line)
      console.log(result)
    }       
  } catch (err) {
    console.error("Error occured: ")
    console.error(err)
  } finally {
    ioInterface.close()
    pgClient?.end()
    console.log("Exit.")
  }
})()
