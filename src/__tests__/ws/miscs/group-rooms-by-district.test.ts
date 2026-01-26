import { groupRoomsByDistrict } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import type { RoomsByDistrict } from "../../../lib/ws/miscs"

let sortGroups = (groups: RoomsByDistrict): RoomsByDistrict => {
  return groups.sort((a, b) => {
    for ( let param of ["region", "district"] ) {
      if ( a.districtid[param] > b.districtid[param] ) {
        return 1
      }
      if ( a.districtid[param] < b.districtid[param] ) {
        return -1
      }
    }
    return 0
  })
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
      }
    }]
  }, {
    tag: 2,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min]: 2,
      }
    }]
  }, {
    tag: 3,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min + 1
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
        [limits.message.room.min + 1]: 1,
      }
    }]
  }, {
    tag: 4,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min + 1,
      room: limits.message.room.min
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
      }
    }, {
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
      }
    }]
  }, {
    tag: 5,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min + 1,
      room: limits.message.room.min + 1
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min + 1,
      room: limits.message.room.min
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min + 1
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
        [limits.message.room.min + 1]: 1,
      }
    }, {
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
      },
      msgcounts: {
        [limits.message.room.min]: 1,
        [limits.message.room.min + 1]: 1,
      }
    },]
  }, {
    tag: 6,
    args: [{
      region: limits.message.region.values[0],
      district: limits.message.district.min + 1,
      room: limits.message.room.min + 4
    }, {
      region: limits.message.region.values[1],
      district: limits.message.district.min,
      room: limits.message.room.min + 4
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      room: limits.message.room.min + 4
    }, {
      region: limits.message.region.values[1],
      district: limits.message.district.min + 1,
      room: limits.message.room.min + 4
    }],
    expres: [{
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
      },
      msgcounts: {
        [limits.message.room.min + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min,
      },
      msgcounts: {
        [limits.message.room.min + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min + 1,
      },
      msgcounts: {
        [limits.message.room.min + 4]: 1,
      }
    }]
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupRoomsByDistrict. Test #${tag}`, () => {
      let result = groupRoomsByDistrict(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})