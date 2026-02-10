import { timingSafeEqual } from "node:crypto"
import { getUserid, getProfile } from "../lib/database/users"
import { checkSessionid } from "../lib/database/checkers"
import env from "../lib/env"
import type { Profile, UserMessage, Message, Messageid } 
  from "../lib/database/interfaces"

export type RedactedProfile = {
  region: string,
  login: string | number,
  name: string | number,
  state: string,
  puid: string,
  timestamp: string | number,
}

export const getSessionid = (header: string | undefined):
  { error: string | undefined, data: string | undefined } => {
  if ( typeof header !== "string" ) {
    return {
      error: "wrongValue.auth.header",
      data: undefined,
    }
  }
  let key = header.split(" ")[1]
  if ( !key ) {
    return {
      error: "wrongValue.auth.header",
      data: undefined,
    }
  }
  let ids = key.split(":")
  if ( ids?.length !== 2 ) {
    return {
      error: "wrongValue.auth.header",
      data: undefined,
    }
  }
  let [ serviceid, sessionid ] = ids
  if ( serviceid?.length !== env.serviceid.length ) {
    return {
      error: "wrongValue.auth.serviceid",
      data: undefined,
    }
  }
  let verified = timingSafeEqual(Buffer.from(serviceid), Buffer.from(env.serviceid))
  if ( !verified ) {
    return {
      error: "wrongValue.auth.serviceid",
      data: undefined,
    }
  }
  return {
    error: undefined,
    data: sessionid,
  }
}

export const readUserid = async (sessionid: string | undefined):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let error = checkSessionid(sessionid)
    if ( error !== undefined ) {
      return {
        error: error,
        data: undefined
      }
    }
    let result = await getUserid(sessionid!)
    return result
  }

export const readProfile = async (sessionid: string | undefined):
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let userid = await readUserid(sessionid)
    if ( userid.error !== undefined ) {
      return {
        error: userid.error,
        data: undefined,
      }
    }
    let result = await getProfile(userid.data)
    return result
  }

export const redactProfile = (profile: Profile | undefined): RedactedProfile | undefined => {
  if ( profile === undefined ) {
    return undefined
  }
  return {
    region: profile.region,
    login: profile.login,
    name: profile.name,
    state: profile.state,
    puid: profile.puid,
    timestamp: profile.timestamp,
  }
}

export const completeMessage = (userMessage: UserMessage, { puid, name }:
  { puid: string, name: string }): Message => {
    return { ...userMessage, puid, username: name }
  }

export const extractMessageids = (messageids: Messageid[]): Messageid[] => {
  return messageids.map(messageid => ({
    region: messageid.region,
    district: messageid.district,
    zone: messageid.zone,
    index: messageid.index,
  }))
}