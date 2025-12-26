import type { Messageid, Districtid } from "./database/messages"

export const listDistricts = (districtids: Districtid[]): Districtid[] => {
  let list = new Map<string, Set<number | string>>()
  for ( let districtid of districtids ) {
    let { region, district } = districtid
    if ( !list.has(region) ) {
      list.set(region, new Set())
    }
    list.get(region).add(district)
  }
  let result: Districtid[] = []
  for ( let [region, districts] of list ) {
    for ( let district of districts ) {
      result.push({ region, district })
    }
  }
  return result
}

export const listRegions = (districtids: Districtid[]): string[] => {
  let list = new Set<string>()
  for ( let districtid of districtids ) {
    list.add(districtid.region)
  }
  return Array.from(list)
}
