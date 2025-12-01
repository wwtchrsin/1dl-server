import { createHash, randomBytes } from "node:crypto"
import { promisify } from "node:util"
import env from "../env"

const randomBytesAsync = promisify(randomBytes)

export const hashPassword = (login: string, password: string) => {
  let data = `${env.hashSalt}${login}${password}`
  return createHash("sha512").update(data).digest("hex")
}

export const hashSession = (sessionid: string) => {
  let data = `${env.hashSalt}${sessionid}`
  return createHash("sha512").update(data).digest("hex")
}

export const generateToken = async () => {
  let bytes = await randomBytesAsync(64)
  return bytes.toString("hex")
}

export const getTimestamp = () => Math.floor((new Date()).valueOf() / 1000)


