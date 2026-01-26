import { limits, patterns } from "./limits"

export const checkRegion = (region: string | undefined): string | undefined => {
   if ( !limits.message.region.values.includes(region) ) {
    return "wrongValues.messages.region"
  }
  return undefined
}

export const checkDistrictid = (req: any): string | undefined => {
  if ( !limits.message.region.values.includes(req?.region) ) {
    return "wrongValues.messages.region"
  }
  let district = Number(req?.district)
  if ( isNaN(district) || district < limits.message.district.min ||
    district > limits.message.district.max || 
    Math.round(district) !== district ) {
      return "wrongValues.messages.district"
    }
  return undefined
}

export const checkRoomid = (req: any): string | undefined => {
  let errorMessage = checkDistrictid(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let room = Number(req?.room)
  if ( isNaN(room) || room < limits.message.room.min || 
    room > limits.message.room.max ||
    Math.round(room) !== room ) {
      return "wrongValues.messages.room"
    }
  return undefined
}

export const checkMessageid = (req: any): string | undefined => {
  let errorMessage = checkRoomid(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let index = Number(req?.index)
  if ( isNaN(index) || index < limits.message.index.min ||
    index > limits.message.index.max ||
    Math.round(index) !== index ) {
      return "wrongValues.messages.index"
    }
  return undefined
}

export const checkMessageContent = (req: any): string | undefined => {
  let textLen = Number(req?.text?.length)
  if ( isNaN(textLen) || textLen < limits.message.text.minLen ||
    textLen > limits.message.text.maxLen ||
    typeof req?.text !== "string" ) {
      return "wrongValues.messages.text"
    }
  if ( !limits.message.color.values.includes(req?.color) ) {
    return "wrongValues.messages.color"
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
    return "wrongValues.users.region"
  }
  let loginLen = Number(req?.login?.length)
  if ( isNaN(loginLen) || loginLen < limits.user.login.minLen ||
    loginLen > limits.user.login.maxLen ||
    typeof req?.login !== "string" ||
    !patterns.login.test(req?.login) ) {
      return "wrongValues.users.login"
    }
  let passwordLen = Number(req?.password?.length)
  if ( isNaN(passwordLen) || passwordLen < limits.user.password.minLen ||
    passwordLen > limits.user.password.maxLen ||
    typeof req?.password !== "string" ||
    !patterns.password.test(req?.password) ) {
      return "wrongValues.users.password"
    }
  let nameLen = Number(req?.name?.length)
  if ( isNaN(nameLen) || nameLen < limits.user.name.minLen ||
    nameLen > limits.user.name.maxLen ||
    typeof req?.name !== "string" ) {
      return "wrongValues.users.name"
    }
  return undefined
}

export const checkUserCredentials = (req: any): string | undefined => {
  let { region, login, password } = req ?? {}
  if ( typeof region !== "string" ) {
    return "wrongValues.auth.region"
  }
  if ( typeof login !== "string" ) {
    return "wrongValues.auth.login"
  }
  if ( typeof password !== "string" ) {
    return "wrongValues.auth.password"
  }
  return undefined
}

export const checkUserid = (userid: string): string | undefined => {
  if ( !patterns.uuid.test(userid) ) {
    return "wrongValues.users.userid"
  }
  return undefined
}

export const checkSessionid = (sessionid: string): string | undefined => {
  if ( !patterns.sessionid.test(sessionid) ) {
    return "wrongValues.auth.sessionid"
  }
  return undefined
}

