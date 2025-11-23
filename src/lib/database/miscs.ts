import { createHash } from "node:crypto"
import env from "../env"

export const hashPassword = (login: string, password: string) => {
  let data = `${env.passwordSalt}${login}${password}`
  return createHash("sha512").update(data).digest("hex")
}

export const getTimestamp = () => Math.floor((new Date()).valueOf() / 1000)


