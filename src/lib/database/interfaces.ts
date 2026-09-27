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
  color: string | null,
  state: string,
  puid: string,
  timestamp: string,
}

export type Credentials = {
  region: string,
  login: string,
  password: string,
}

export type Location = {
  region: string,
  tag: string,
}

export type Messageid = Location & {
  index: string | number,
}

export type MessageContent = {
  text: string,
  color: string,
}

export type UserMessage = {
  region: string,
  tag: string,
  index: number,
  text: string,
  color: string,
  timestamp: string
}

export type Message = UserMessage & {
  puid: string,
  username: string,
}


