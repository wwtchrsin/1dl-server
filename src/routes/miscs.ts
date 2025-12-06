import { getUserid } from "../lib/database/users"

export const getPrivateUserid = async (header: string | undefined):
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
    let result = await getUserid(session)
    return result
  }
