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
  login: string,
  password: string,
}

export type Districtid = {
  region: string,
  district: string | number,
}

export type Roomid = Districtid & {
  room: string | number,
}

export type Messageid = Roomid & {
  index: string | number,
}

export type MessageContent = {
  text: string,
  color: string,
}

export type UserMessage = {
  region: string,
  district: number,
  room: number,
  index: number,
  text: string,
  color: string,
  timestamp: string
}

export type Message = UserMessage & {
  puid: string,
  username: string,
}

export type RoomMsgcount = {
  room: number,
  msgcount: number,
}

export type DistrictMsgcount = {
  district: number,
  msgcount: number,
}

export type Msgcounts = Record<string | number, number>

