
export const getAuthToken = (auth: string | undefined): 
  { error: string | undefined, data: string | undefined } => {
    if ( typeof auth !== "string" ) {
      return {
        error: "authErrors.header",
        data: undefined,
      }
    }
    let token = auth.split(" ")[1]
    if ( !token ) {
      return {
        error: "authErrors.header",
        data: undefined,
      }
    }
    return {
      error: undefined,
      data: token,
    }
  }
