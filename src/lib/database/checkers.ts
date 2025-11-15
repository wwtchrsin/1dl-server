import limits from "./limits"
import { wrongValues } from "../error-messages"
import type { TextResource } from "../langs"
import type { RoomParams } from "./interfaces"

export const checkRoomParams = (req: any): TextResource | undefined => {
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

