import { limits, patterns } from "./limits"

export const checkRegion = (region: string | undefined): string | undefined => {
   if ( !limits.message.region.values.includes(region) ) {
    return "wrongValue.message.region"
  }
  return undefined
}

export const checkDistrictid = (req: any): string | undefined => {
  if ( !limits.message.region.values.includes(req?.region) ) {
    return "wrongValue.message.region"
  }
  let district = Number(req?.district)
  if ( isNaN(district) || district < limits.message.district.min ||
    district > limits.message.district.max || 
    Math.round(district) !== district ) {
      return "wrongValue.message.district"
    }
  return undefined
}

export const checkZoneid = (req: any): string | undefined => {
  let errorMessage = checkDistrictid(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let zone = Number(req?.zone)
  if ( isNaN(zone) || zone < limits.message.zone.min || 
    zone > limits.message.zone.max ||
    Math.round(zone) !== zone ) {
      return "wrongValue.message.zone"
    }
  return undefined
}

export const checkMessageid = (req: any): string | undefined => {
  let errorMessage = checkZoneid(req)
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
  if ( typeof req?.identifier !== "string" ||
    !patterns.sessionid.test(req?.identifier) ) {
      return "wrongValue.user.identifier"
    }
  return undefined
}

export const checkUserCredentials = (req: any): string | undefined => {
  let { region, login, password, identifier } = req ?? {}
  if ( typeof region !== "string" ) {
    return "wrongValue.auth.region"
  }
  if ( typeof login !== "string" ) {
    return "wrongValue.auth.login"
  }
  if ( typeof password !== "string" ) {
    return "wrongValue.auth.password"
  }
  if ( typeof identifier !== "string" || 
    !patterns.sessionid.test(identifier) ) {
    return "wrongValue.auth.identifier"
  }
  return undefined
}

export const checkUserid = (userid: string): string | undefined => {
  if ( !patterns.uuid.test(userid) ) {
    return "wrongValue.user.userid"
  }
  return undefined
}

export const checkSessionid = (sessionid: string | undefined): string | undefined => {
  if ( !sessionid || !patterns.sessionid.test(sessionid) ) {
    return "wrongValue.auth.sessionid"
  }
  return undefined
}




