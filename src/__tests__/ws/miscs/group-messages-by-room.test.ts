import { groupMessagesByRoom } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import type { Messageid, Message } from "../../../lib/database/interfaces"
import type { MessagesByRoom } from "../../../lib/ws/miscs"

let toMessages = (messageids: Messageid[]): Message[] => {
  let messages: Message[] = []
  for ( let messageid of messageids ) {
    messages.push({
      region: messageid.region,
      district: +messageid.district,
      room: +messageid.room,
      index: +messageid.index,
      text: examples.text.correct[0],
      color: limits.messages.colors[0],
      username: examples.name.correct[0],
      puid: examples.uuid[0],
      timestamp: "123456789",
    })
  }
  return messages
}

let sortGroups = (groups: MessagesByRoom): MessagesByRoom => {
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
    groups[i].messages.sort((a, b) => a.index - b.index)
  }
  return groups
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: toMessages([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }]),
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }]),
    }],
  }, {
    tag: 2,
    args: toMessages([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
    }]),
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }, {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin + 1,
      }]),
    }],
  }, {
    tag: 3,
    args: toMessages([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 4,
    }]),
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }]),
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
        index: limits.messages.indexMin + 4,
      }]),
    }],
  }, {
    tag: 4,
    args: toMessages([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 1,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin + 1,
    }]),
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }, {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin + 1,
      }]),
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
        index: limits.messages.indexMin,
      }, {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin + 1,
        index: limits.messages.indexMin + 1,
      }]),
    }],
  }, {
    tag: 5,
    args: toMessages([{
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
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }]),
    expres: [{
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }]),
    }, {
      roomid: {
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[0],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }])
    }, {
      roomid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[1],
        district: limits.messages.districtMin,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }])
    }, {
      roomid: {
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
      },
      messages: toMessages([{
        region: limits.messages.regions[1],
        district: limits.messages.districtMin + 1,
        room: limits.messages.roomMin,
        index: limits.messages.indexMin,
      }])
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessagesByRoom. Test #${tag}`, () => {
      let result = groupMessagesByRoom(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})
