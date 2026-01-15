import type { Message, Roomid, Districtid, Messageid } 
  from "../database/interfaces"

export type MessagesByRoom = ({
  roomid: Roomid,
  messages: Message[]
})[]

export type MessageidsByRoom = ({
  roomid: Roomid,
  indices: (number | string)[]
})[]

export type RoomsByDistrict = ({
  districtid: Districtid,
  msgcounts: Record<number | string, number>,
})[]

export type DistrictsByRegion = ({
  region: string,
  msgcounts: Record<number | string, number>,
})[]

export type MsgcountsGroups = ({
  msgcounts: Record<number | string, number>
})[]

export type MsgcountsModifier = (value: number | string) => number

export const groupMessagesByRoom = (messages: Message[]): MessagesByRoom => {
  let regions = new Map<string, Map<number, Map<number, Message[]>>>()
  for ( let message of messages ) {
    let { region, district, room } = message
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(room) ) {
      regions.get(region).get(district).set(room, [])
    }
    regions.get(region).get(district).get(room).push(message)
  }
  let groups: MessagesByRoom = []
  for ( let [region, districts] of regions ) {
    for ( let [district, rooms] of districts ) {
      for ( let [room, messages] of rooms ) {
        groups.push({
          roomid: { region, district, room },
          messages,
        })
      }
    }
  }
  return groups
}

export const groupMessageidsByRoom = (messageids: Messageid[]): MessageidsByRoom => {
  type Rooms = Map<string | number, Set<number | string>>
  let regions = new Map<string, Map<string | number, Rooms>>()
  for ( let messageid of messageids ) {
    let { region, district, room, index } = messageid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(room) ) {
      regions.get(region).get(district).set(room, new Set())
    }
    regions.get(region).get(district).get(room).add(index)
  }
  let groups: MessageidsByRoom = []
  for ( let [region, districts] of regions ) {
    for ( let [district, rooms] of districts ) {
      for ( let [room, indices] of rooms ) {
        groups.push({
          roomid: { region, district, room },
          indices: Array.from(indices),
        })
      }
    }
  }
  return groups
}

export const groupRoomsByDistrict = (roomids: Roomid[]): RoomsByDistrict => {
  type Room = Map<number | string, number>
  let regions = new Map<string, Map<number | string, Room>>()
  for ( let roomid of roomids ) {
    let { region, district, room } = roomid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(room) ) {
      regions.get(region).get(district).set(room, 0)
    }
    let value = regions.get(region).get(district).get(room)
    regions.get(region).get(district).set(room, value + 1)
  }
  let groups: RoomsByDistrict = []
  for ( let [region, districts] of regions ) {
    for ( let [district, rooms] of districts ) {
      let msgcounts: Record<number | string, number> = {}
      for ( let [room, count] of rooms ) {
        msgcounts[room] = count
      }
      groups.push({
        districtid: { region, district },
        msgcounts,
      })
    }
  }
  return groups
}

export const groupDistrictsByRegion = (districtids: Districtid[]): DistrictsByRegion => {
  let regions = new Map<string, Map<number | string, number>>()
  for ( let districtid of districtids ) {
    let { region, district } = districtid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, 0)
    }
    let value = regions.get(region).get(district)
    regions.get(region).set(district, value + 1)
  }
  let groups: DistrictsByRegion = []
  for ( let [region, districts] of regions ) {
    let msgcounts: Record<number | string, number> = {}
    for ( let [district, count] of districts ) {
      msgcounts[district] = count
    }
    groups.push({ region, msgcounts })
  }
  return groups
}

export const modifyMsgcounts = (groups: MsgcountsGroups, modifier: MsgcountsModifier) => {
    for ( let i=0; i < groups.length; i++ ) {
      for ( let key in groups[i].msgcounts ) {
        let value = modifier(+groups[i].msgcounts[key])
        groups[i].msgcounts[key] = value
      }
    }
  }

export const getRoomLocation = (roomid: Roomid) => {
  return `/${roomid.region}/${roomid.district}/${roomid.room}`
}

export const getDistrictLocation = (districtid: Districtid) => {
  return `/${districtid.region}/${districtid.district}`
}

export const getRegionLocation = ({ region }: { region: string }) => {
  return `/${region}`
}

export const getLocation = (data: any): string => {
  if ( !data ) {
    return ""
  }
  let location = ""
  for ( let name of ["region", "district", "room"] ) {
    let value = data[name]
    if ( value === undefined ) {
      break
    }
    location += `/${value}`
  }
  return location
}