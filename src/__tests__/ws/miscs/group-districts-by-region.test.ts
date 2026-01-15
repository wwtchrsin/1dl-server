import { groupDistrictsByRegion } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import { DistrictsByRegion } from "../../../lib/ws/miscs"

let sortGroups = (groups: DistrictsByRegion): DistrictsByRegion => {
  return groups.sort((a, b) => {
    if ( a.region > b.region ) {
      return 1
    }
    if ( a.region < b.region ) {
      return -1
    }
    return 0
  })
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }],
    expres: [{
      region: limits.messages.regions[0],
      msgcounts: {
        [limits.messages.districtMin]: 1,
      },
    }],
  }, {
    tag: 2,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }],
    expres: [{
      region: limits.messages.regions[0],
      msgcounts: {
        [limits.messages.districtMin]: 2,
      },
    }],
  }, {
    tag: 3,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
    }],
    expres: [{
      region: limits.messages.regions[0],
      msgcounts: {
        [limits.messages.districtMin]: 1,
        [limits.messages.districtMin + 1]: 1,
      },
    }],
  }, {
    tag: 4,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }],
    expres: [{
      region: limits.messages.regions[0],
      msgcounts: {
        [limits.messages.districtMin]: 1,
      },
    }, {
      region: limits.messages.regions[1],
      msgcounts: {
        [limits.messages.districtMin]: 1,
      },
    }],
  }, {
    tag: 5,
    args: [{
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
    }],
    expres: [{
      region: limits.messages.regions[0],
      msgcounts: {
        [limits.messages.districtMin]: 1,
        [limits.messages.districtMin + 1]: 1,
      },
    }, {
      region: limits.messages.regions[1],
      msgcounts: {
        [limits.messages.districtMin]: 1,
        [limits.messages.districtMin + 1]: 1,
      },
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupRoomsByDistrict. Test #${tag}`, () => {
      let result = groupDistrictsByRegion(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})



