import type { Message, Zoneid, Districtid, Messageid } 
  from "../database/interfaces"

export type MessagesByZone = ({
  zoneid: Zoneid,
  messages: Message[]
})[]

export type MessageidsByZone = ({
  zoneid: Zoneid,
  indices: (number | string)[]
})[]

export type ZonesByDistrict = ({
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

export const groupMessagesByZone = (messages: Message[]): MessagesByZone => {
  let regions = new Map<string, Map<number, Map<number, Message[]>>>()
  for ( let message of messages ) {
    let { region, district, zone } = message
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(zone) ) {
      regions.get(region).get(district).set(zone, [])
    }
    regions.get(region).get(district).get(zone).push(message)
  }
  let groups: MessagesByZone = []
  for ( let [region, districts] of regions ) {
    for ( let [district, zones] of districts ) {
      for ( let [zone, messages] of zones ) {
        groups.push({
          zoneid: { region, district, zone },
          messages,
        })
      }
    }
  }
  return groups
}

export const groupMessageidsByZone = (messageids: Messageid[]): MessageidsByZone => {
  type Zones = Map<string | number, Set<number | string>>
  let regions = new Map<string, Map<string | number, Zones>>()
  for ( let messageid of messageids ) {
    let { region, district, zone, index } = messageid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(zone) ) {
      regions.get(region).get(district).set(zone, new Set())
    }
    regions.get(region).get(district).get(zone).add(index)
  }
  let groups: MessageidsByZone = []
  for ( let [region, districts] of regions ) {
    for ( let [district, zones] of districts ) {
      for ( let [zone, indices] of zones ) {
        groups.push({
          zoneid: { region, district, zone },
          indices: Array.from(indices),
        })
      }
    }
  }
  return groups
}

export const groupZonesByDistrict = (zoneids: Zoneid[]): ZonesByDistrict => {
  type Zone = Map<number | string, number>
  let regions = new Map<string, Map<number | string, Zone>>()
  for ( let zoneid of zoneids ) {
    let { region, district, zone } = zoneid
    if ( !regions.has(region) ) {
      regions.set(region, new Map())
    }
    if ( !regions.get(region).has(district) ) {
      regions.get(region).set(district, new Map())
    }
    if ( !regions.get(region).get(district).has(zone) ) {
      regions.get(region).get(district).set(zone, 0)
    }
    let value = regions.get(region).get(district).get(zone)
    regions.get(region).get(district).set(zone, value + 1)
  }
  let groups: ZonesByDistrict = []
  for ( let [region, districts] of regions ) {
    for ( let [district, zones] of districts ) {
      let msgcounts: Record<number | string, number> = {}
      for ( let [zone, count] of zones ) {
        msgcounts[zone] = count
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

export const getZoneLocation = (zoneid: Zoneid) => {
  return `/${zoneid.region}/${zoneid.district}/${zoneid.zone}`
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
  for ( let name of ["region", "district", "zone"] ) {
    let value = data[name]
    if ( value === undefined ) {
      break
    }
    location += `/${value}`
  }
  return location
}