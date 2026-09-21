import type { Message, Location, Messageid } 
  from "../database/interfaces"

export type MessagesByLocation = ({
  location: Location,
  messages: Message[]
})[]

export type MessageidsByLocation = ({
  location: Location,
  indices: (number | string)[]
})[]

export const groupMessagesByLocation = (messages: Message[]): MessagesByLocation => {
  let regions = new Map<string, Map<string, Message[]>>()
  for ( let message of messages ) {
    let { region, tag } = message
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(tag) ) {
      regions.get(region).set(tag, [])
    }
    regions.get(region).get(tag).push(message)
  }
  let groups: MessagesByLocation = []
  for ( let [region, tags] of regions ) {
    for ( let [tag, messages] of tags ) {
      groups.push({
        location: { region, tag },
        messages,
      })
    }
  }
  return groups
}

export const groupMessageidsByLocation = (messageids: Messageid[]): MessageidsByLocation => {
  let regions = new Map<string, Map<string, Set<string | number>>>()
  for ( let messageid of messageids ) {
    let { region, tag, index } = messageid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(tag) ) {
      regions.get(region).set(tag, new Set())
    }
    regions.get(region).get(tag).add(index)
  }
  let groups: MessageidsByLocation = []
  for ( let [region, tags] of regions ) {
    for ( let [tag, indices] of tags ) {
      groups.push({
        location: { region, tag },
        indices: Array.from(indices),
      })
    }
  }
  return groups
}

export const getLocation = (data: any): string => {
  if ( !data ) {
    return ""
  }
  let location = ""
  for ( let name of ["region", "tag"] ) {
    let value = data[name]
    if ( value === undefined ) {
      break
    }
    location += `/${value}`
  }
  return location
}