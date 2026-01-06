import { getUserid, getProfile } from "../lib/database/users"
import { checkUserid, checkSessionid } from "../lib/database/checkers"
import type { Profile } from "../lib/database/interfaces"

export const getToken = (header: string | undefined):
  { error: string | undefined, data: string | undefined } => {
    if ( typeof header !== "string" ) {
      return {
        error: "wrongValues.auth.header",
        data: undefined,
      }
    }
    let session = header.split(" ")[1]
    if ( !session ) {
      return {
        error: "wrongValues.auth.header",
        data: undefined,
      }
    }
    let checkError = checkSessionid(session)
    if ( checkError !== undefined ) {
      return {
        error: checkError,
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: session,
    }
  }

export const readUserid = async (header: string | undefined):
  Promise<{ error: string | undefined, data: string | undefined }> => {
    let session = getToken(header)
    if ( session.error !== undefined ) {
      return {
        error: session.error,
        data: undefined
      }
    }
    let result = await getUserid(session.data)
    return result
  }

export const readProfile = async (header: string | undefined):
  Promise<{ error: string | undefined, data: Profile | undefined }> => {
    let userid = await readUserid(header)
    if ( userid.error !== undefined ) {
      return {
        error: userid.error,
        data: undefined,
      }
    }
    let checkError = checkUserid(userid.data)
    if ( checkError !== undefined ) {
      return {
        error: checkError,
        data: undefined,
      }
    }
    let result = await getProfile(userid.data)
    return result
  }

export const redactProfile = (profile: Profile | undefined) => {
  if ( profile === undefined ) {
    return undefined
  }
  return {
    login: profile.login,
    name: profile.name,
    state: profile.state,
    puid: profile.puid,
    timestamp: profile.timestamp,
  }
}

