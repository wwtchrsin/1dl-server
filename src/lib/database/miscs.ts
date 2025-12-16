import { createHash, randomBytes } from "node:crypto"
import { promisify } from "node:util"
import { limits } from "./limits"
import env from "../env"
import logger from "../logger"

export const getHashingAlgorithm = (hashSize: number) => {
  switch ( hashSize ) {
    case 64: return "sha256"
    case 96: return "sha384"
    case 128: return "sha512"
    default: {
      logger.fatal({ hashSize }, "database/miscs/getHashingAlgorith")
      process.exit(1)
    }
  }
}

const hashingAlgorithms = {
  password: getHashingAlgorithm(limits.users.passwordHashSize),
  sessionid: getHashingAlgorithm(limits.sessions.sessionidHashSize),
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
  let bytes = await randomBytesAsync(limits.sessions.sessionidSize / 2)
  return bytes.toString("hex")
}

export const getTimestamp = () => Math.floor((new Date()).valueOf() / 1000)


