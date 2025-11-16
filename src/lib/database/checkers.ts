import limits from "./limits"
import { wrongValues } from "../error-messages"

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
    Math.round(textLen) !== textLen ) {
      return wrongValues.messages.text
    }
  if ( !limits.messages.colors.includes(req?.color) ) {
    return wrongValues.messages.color
  }
  return undefined
}
  
