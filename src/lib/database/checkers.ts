import { limits, patterns } from "./limits"

export const checkRegion = (region: string | undefined): string | undefined => {
   if ( !limits.message.region.values.includes(region) ) {
    return "wrongValue.message.region"
  }
  return undefined
}

export const checkLocation = (req: any): string | undefined => {
  if ( !limits.message.region.values.includes(req?.region) ) {
    return "wrongValue.message.region"
  }
  if ( typeof req?.tag !== "string" || !patterns.tag.test(req?.tag) ) {
    return "wrongValue.message.tag"
  }
  return undefined
}

export const checkMessageid = (req: any): string | undefined => {
  let errorMessage = checkLocation(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let index = Number(req?.index)
  if ( isNaN(index) || index < limits.message.index.min ||
    index > limits.message.index.max ||
    Math.round(index) !== index ) {
      return "wrongValue.message.index"
    }
  return undefined
}

export const checkMessageContent = (req: any): string | undefined => {
  if ( typeof req?.text !== "string" ||
    !patterns.text.test(req?.text) ) {
      return "wrongValue.message.text"
    }
  if ( !limits.message.color.values.includes(req?.color) ) {
    return "wrongValue.message.color"
  }
  return undefined
}

export const checkMessageData = (userid: string | undefined, messageid: any, content: any):
  string | undefined => {
    let useridCheckError = checkUserid(userid)
    if ( useridCheckError !== undefined ) {
      return useridCheckError
    }
    let messageidCheckError = checkMessageid(messageid)
    if ( messageidCheckError !== undefined ) {
      return messageidCheckError
    }
    let contentCheckError = checkMessageContent(content)
    if ( contentCheckError !== undefined ) {
      return contentCheckError
    }
    return undefined
  }

export const checkUserData = (req: any): string | undefined => {
  if ( !limits.message.region.values.includes(req?.region) ) {
    return "wrongValue.user.region"
  }
  if ( typeof req?.login !== "string" || 
    !patterns.login.test(req?.login) ) {
      return "wrongValue.user.login"
    }
  if ( typeof req?.password !== "string" ||
    !patterns.password.test(req?.password) ) {
      return "wrongValue.user.password"
    }
  if ( typeof req?.name !== "string" ||
    !patterns.name.test(req?.name) ) {
      return "wrongValue.user.name"
    }
  return undefined
}

export const checkUserCredentials = (req: any): string | undefined => {
  let { region, login, password } = req ?? {}
  if ( typeof region !== "string" ) {
    return "wrongValue.auth.region"
  }
  if ( typeof login !== "string" ) {
    return "wrongValue.auth.login"
  }
  if ( typeof password !== "string" ) {
    return "wrongValue.auth.password"
  }
  return undefined
}

export const checkUserid = (userid: string): string | undefined => {
  if ( !patterns.uuid.test(userid) ) {
    return "wrongValue.user.userid"
  }
  return undefined
}

export const checkSessionid = (sessionid: any): string | undefined => {
  if ( typeof sessionid !== "string" || !patterns.sessionid.test(sessionid) ) {
    return "wrongValue.auth.sessionid"
  }
  return undefined
}

export const checkDeviceid = (deviceid: string | undefined): string | undefined => {
  if ( typeof deviceid !== "string" || !patterns.sessionid.test(deviceid) ) {
    return "wrongValue.user.deviceid"
  }
  return undefined
}


