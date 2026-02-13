export type UserData = {
  region: string,
  login: string,
  password: string,
  name: string,
}

export type Profile = {
  userid: string,
  region: string,
  login: string,
  name: string,
  state: string,
  puid: string,
  timestamp: string,
}

export type Credentials = {
  region: string,
  login: string,
  password: string,
}

export type Districtid = {
  region: string,
  district: string | number,
}

export type Zoneid = Districtid & {
  zone: string | number,
}

export type Messageid = Zoneid & {
  index: string | number,
}

export type MessageContent = {
  text: string,
  color: string,
}

export type UserMessage = {
  region: string,
  district: number,
  zone: number,
  index: number,
  text: string,
  color: string,
  timestamp: string
}

export type Message = UserMessage & {
  puid: string,
  username: string,
}

export type ZoneMsgcount = {
  zone: number,
  msgcount: number,
}

export type DistrictMsgcount = {
  district: number,
  msgcount: number,
}

export type Msgcounts = Record<string | number, number>

