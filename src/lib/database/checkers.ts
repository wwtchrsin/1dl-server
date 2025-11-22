import limits from "./limits"
import { wrongValues } from "../error-messages"

const loginPattern = new RegExp(limits.users.loginPattern)
const passwordPattern = new RegExp(limits.users.passwordPattern)
const uuidPattern = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}$/

export const checkRoomIds = (req: any): TextResource | undefined => {
  if ( !limits.messages.regions.includes(req?.region) ) {
    return wrongValues.messages.region
  }
  let district = Number(req?.district)
  if ( isNaN(district) || district < limits.messages.districtMin ||
    district > limits.messages.districtMax || 
    Math.round(district) !== district ) {
      return wrongValues.messages.district
    }
  let room = Number(req?.room)
  if ( isNaN(room) || room < limits.messages.roomMin || 
    room > limits.messages.roomMax ||
    Math.round(room) !== room ) {
      return wrongValues.messages.room
    }
  return undefined
}

export const checkMessageIds = (req: any): TextResource | undefined => {
  let errorMessage = checkRoomIds(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let index = Number(req?.index)
  if ( isNaN(index) || index < limits.messages.indexMin ||
    index > limits.messages.indexMax ||
    Math.round(index) !== index ) {
      return wrongValues.messages.index
    }

  return undefined
}

export const checkMessageContent = (req: any): TextResource | undefined => {
  let errorMessage = checkMessageIds(req)
  if ( errorMessage !== undefined ) {
    return errorMessage
  }
  let textLen = Number(req?.text?.length)
  if ( isNaN(textLen) || textLen < limits.messages.textLenMin ||
    textLen > limits.messages.textLenMax ||
    typeof req?.text !== "string" ) {
      return wrongValues.messages.text
    }
  if ( !limits.messages.colors.includes(req?.color) ) {
    return wrongValues.messages.color
  }
  return undefined
}

export const checkUserData = (req: any): TextResource | undefined => {
  let loginLen = Number(req?.login?.length)
  if ( isNaN(loginLen) || loginLen < limits.users.loginLenMin ||
    loginLen > limits.users.loginLenMax ||
    typeof req?.login !== "string" ||
    !loginPattern.test(req?.login) ) {
      return wrongValues.users.login
    }
  let passwordLen = Number(req?.password?.length)
  if ( isNaN(passwordLen) || passwordLen < limits.users.passwordLenMin ||
    passwordLen > limits.users.passwordLenMax ||
    typeof req?.password !== "string" ||
    !passwordPattern.test(req?.password) ) {
      return wrongValues.users.password
    }
  let nameLen = Number(req?.name?.length)
  if ( isNaN(nameLen) || nameLen < limits.users.nameLenMin ||
    nameLen > limits.users.nameLenMax ||
    typeof req?.name !== "string" ) {
      return wrongValues.users.name
    }
  return undefined
}

export const checkUserId = (userid: string): TestResource | undefined => {
  if ( !uuidPattern.test(userid) ) {
    return wrongValues.users.userid
  }
  return undefined
}

