import { Message, Messageid, Districtid } from "../database/interfaces"

export type CreatedMessages = {
  messages: Message[],
}

export type DeletedMessages = {
  messageids: Messageid[],
}

export type ZoneMsgcountsUpdate = {
  districtid: Districtid,
  msgcounts: Record<string | number, number>,
}

export type DistrictMsgcountsUpdate = {
  region: string,
  msgcounts: Record<string | number, number>,
}

