import { limits, patterns } from "./limits"

export const checkRegion = (region: string | undefined): string | undefined => {
   if ( !limits.messages.regions.includes(region) ) {
    return "wrongValues.messages.region"
  }
  return undefined
}

export const checkDistrictid = (req: any): string | undefined => {
  if ( !limits.messages.regions.includes(req?.region) ) {
    return "wrongValues.messages.region"
  }
  let district = Number(req?.district)
  if ( isNaN(district) || district < limits.messages.districtMin ||
    district > limits.messages.districtMax || 
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
  if ( isNaN(room) || room < limits.messages.roomMin || 
    room > limits.messages.roomMax ||
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
  if ( isNaN(index) || index < limits.messages.indexMin ||
    index > limits.messages.indexMax ||
    Math.round(index) !== index ) {
      return "wrongValues.messages.index"
    }
  return undefined
}

export const checkMessageContent = (req: any): string | undefined => {
  let textLen = Number(req?.text?.length)
  if ( isNaN(textLen) || textLen < limits.messages.textLenMin ||
    textLen > limits.messages.textLenMax ||
    typeof req?.text !== "string" ) {
      return "wrongValues.messages.text"
    }
  if ( !limits.messages.colors.includes(req?.color) ) {
    return "wrongValues.messages.color"
  }
  return undefined
}

export const checkUserData = (req: any): string | undefined => {
  let loginLen = Number(req?.login?.length)
  if ( isNaN(loginLen) || loginLen < limits.users.loginLenMin ||
    loginLen > limits.users.loginLenMax ||
    typeof req?.login !== "string" ||
    !patterns.login.test(req?.login) ) {
      return "wrongValues.users.login"
    }
  let passwordLen = Number(req?.password?.length)
  if ( isNaN(passwordLen) || passwordLen < limits.users.passwordLenMin ||
    passwordLen > limits.users.passwordLenMax ||
    typeof req?.password !== "string" ||
    !patterns.password.test(req?.password) ) {
      return "wrongValues.users.password"
    }
  let nameLen = Number(req?.name?.length)
  if ( isNaN(nameLen) || nameLen < limits.users.nameLenMin ||
    nameLen > limits.users.nameLenMax ||
    typeof req?.name !== "string" ) {
      return "wrongValues.users.name"
    }
  return undefined
}

export const checkUserCredentials = (req: any): string | undefined => {
  let { login, password } = req
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

