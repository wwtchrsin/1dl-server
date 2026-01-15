import { groupMessageidsByRoom } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import type { MessageidsByRoom } from "../../../lib/ws/miscs"

let sortGroups = (groups: MessageidsByRoom): MessageidsByRoom => {
  groups.sort((a, b) => {
    for ( let param of ["region", "district", "room"] ) {
      if ( a.roomid[param] > b.roomid[param] ) {
        return 1
      }
      if ( a.roomid[param] < b.roomid[param] ) {
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
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }],
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin
      ],
    }],
  }, {
    tag: 2,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
    }],
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
        limits.messages.indexMin + 1,
      ],
    }],
  }, {
    tag: 3,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 4,
    }],
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
      ],
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
      },
      indices: [
        limits.messages.indexMin + 4,
      ],
    }],
  }, {
    tag: 4,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 2,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 2,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 4,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }],
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
        limits.messages.indexMin + 2,
      ],
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
      },
      indices: [
        limits.messages.indexMin + 2,
        limits.messages.indexMin + 4,
      ],
    }],
  }, {
    tag: 5,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }],
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
      ],
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
      ],
    }, {
      roomid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
      ],
    }, {
      roomid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
      },
      indices: [
        limits.messages.indexMin,
      ],
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessagidsByRoom. Test #${tag}`, () => {
      let result = groupMessageidsByRoom(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})



