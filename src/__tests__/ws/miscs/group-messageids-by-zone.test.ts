import { groupMessageidsByZone } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import type { MessageidsByZone } from "../../../lib/ws/miscs"

let sortGroups = (groups: MessageidsByZone): MessageidsByZone => {
  groups.sort((a, b) => {
    for ( let param of ["region", "district", "zone"] ) {
      if ( a.zoneid[param] > b.zoneid[param] ) {
        return 1
      }
      if ( a.zoneid[param] < b.zoneid[param] ) {
        return -1
      }
    }
    return 0
  })
  for ( let i=0; i < groups.length; i++ ) {
    groups[i].indices.sort((a, b) => +a - +b)
  }
  return groups
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }],
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min
      ],
    }],
  }, {
    tag: 2,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min + 1,
    }],
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
        limits.message.index.min + 1,
      ],
    }],
  }, {
    tag: 3,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min + 4,
    }],
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
      },
      indices: [
        limits.message.index.min + 4,
      ],
    }],
  }, {
    tag: 4,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min + 2,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min + 2,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min + 4,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }],
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
        limits.message.index.min + 2,
      ],
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
      },
      indices: [
        limits.message.index.min + 2,
        limits.message.index.min + 4,
      ],
    }],
  }, {
    tag: 5,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min + 1,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[1],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[1],
      district: limits.message.district.min + 1,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }],
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      zoneid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      zoneid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
      },
      indices: [
        limits.message.index.min,
      ],
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessagidsByZone. Test #${tag}`, () => {
      let result = groupMessageidsByZone(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})



