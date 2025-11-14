import type { Client, Pool } from "pg"
import limits from "./limits"
import { wrongValues } from "../error-messages"
import type { TextResource } from "../langs"

type PgClient = Client | Pool

export interface RoomReqParams {
  region: string
  district: string
  room: string
}

export interface RoomParams {
  region: string
  district: number
  room: number
}

export const castRoomParams = (req: RoomReqParams):
  [undefined, RoomParams] | [TextResource, undefined] => {
    let region = req.region?.toLowerCase()
    if ( !limits.messages.regions.includes(region) ) {
      return [wrongValues.messages.region, undefined]
    }
    let district = Number(req.district)
    if ( isNaN(district) || district < limits.messages.districtMin ||
      district > limits.messages.districtMax || 
      Math.round(district) !== district ) {
        return [wrongValues.messages.district, undefined]
      }
    let room = Number(req.room)
    if ( isNaN(room) || room < limits.messages.roomMin || 
      room > limits.messages.roomMax ||
      Math.round(room) !== room ) {
        return [wrongValues.messages.room, undefined]
      }
    return [undefined, { region, district, room }]
  }

