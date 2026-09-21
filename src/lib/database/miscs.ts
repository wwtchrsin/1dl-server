import { createHash, randomBytes } from "node:crypto"
import { promisify } from "node:util"
import { limits, hashSizes } from "./limits"
import env from "../env"
import logger from "../logger"

export const getHashingAlgorithm = (hashSize: number) => {
  switch ( hashSize ) {
    case 32: return "sha256"
    case 48: return "sha384"
    case 64: return "sha512"
    default: {
      logger.fatal({ hashSize }, "database/miscs/getHashingAlgorith")
      process.exit(1)
    }
  }
}

const hashingAlgorithms = {
  password: getHashingAlgorithm(hashSizes.password),
  sessionid: getHashingAlgorithm(hashSizes.sessionid),
}

const randomBytesAsync = promisify(randomBytes)

export const hashPassword = (login: string, password: string) => {
  let data = `${env.hashSalt}${login}${password}`
  return createHash(hashingAlgorithms.password).update(data).digest("hex")
}

export const hashSession = (sessionid: string) => {
  let data = `${env.hashSalt}${sessionid}`
  return createHash(hashingAlgorithms.sessionid).update(data).digest("hex")
}

export const generateToken = async () => {
  let bytes = await randomBytesAsync(limits.session.sessionid.size)
  return bytes.toString("hex")
}

export const getTimestamp = () => Math.floor((new Date()).valueOf() / 1000)

export const redactPassword = (data: any) => {
  if ( !data || typeof data !== "object" || Array.isArray(data) ) {
    return data
  }
  let redacted = { ...data }
  if ( redacted.password ) {
    redacted.password = "[REDACTED]"
  }
  return redacted
}


  


