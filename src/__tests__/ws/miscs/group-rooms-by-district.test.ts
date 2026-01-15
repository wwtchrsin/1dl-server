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
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
      }
    }]
  }, {
    tag: 2,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin]: 2,
      }
    }]
  }, {
    tag: 3,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
        [limits.messages.roomMin + 1]: 1,
      }
    }]
  }, {
    tag: 4,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
      }
    }, {
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
      }
    }]
  }, {
    tag: 5,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 1
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
        [limits.messages.roomMin + 1]: 1,
      }
    }, {
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
      },
      msgcounts: {
        [limits.messages.roomMin]: 1,
        [limits.messages.roomMin + 1]: 1,
      }
    },]
  }, {
    tag: 6,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 4
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 4
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 4
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 4
    }],
    expres: [{
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
      },
      msgcounts: {
        [limits.messages.roomMin + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin,
      },
      msgcounts: {
        [limits.messages.roomMin + 4]: 1,
      }
    }, {
      districtid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 1,
      },
      msgcounts: {
        [limits.messages.roomMin + 4]: 1,
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