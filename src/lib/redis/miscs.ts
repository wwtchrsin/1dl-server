import { getTimestamp } from "../database/miscs"

export const encodeMsgcounts = (msgcounts: Record<string | number, number>) => {
  let timestamp = getTimestamp()
  return { ...msgcounts, timestamp }
}

export const decodeMsgcounts = (msgcounts: Record<string, string>) => {
  let result: Record<string, number> = {}
  for ( let index in msgcounts ) {
    if ( index === "timestamp" ) {
      continue
    }
    result[index] = Number(msgcounts[index])
  }
  return result
}