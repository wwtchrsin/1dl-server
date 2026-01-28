import { groupMessagesByZone } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import type { Messageid, Message } from "../../../lib/database/interfaces"
import type { MessagesByZone } from "../../../lib/ws/miscs"

let toMessages = (messageids: Messageid[]): Message[] => {
  let messages: Message[] = []
  for ( let messageid of messageids ) {
    messages.push({
      region: messageid.region,
      district: +messageid.district,
      zone: +messageid.zone,
      index: +messageid.index,
      text: examples.text.correct[0],
      color: limits.message.color.values[0],
      username: examples.name.correct[0],
      puid: examples.uuid[0],
      timestamp: "123456789",
    })
  }
  return messages
}

let sortGroups = (groups: MessagesByZone): MessagesByZone => {
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
    groups[i].messages.sort((a, b) => a.index - b.index)
  }
  return groups
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: toMessages([{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }]),
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }]),
    }],
  }, {
    tag: 2,
    args: toMessages([{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min + 1,
    }]),
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min + 1,
      }]),
    }],
  }, {
    tag: 3,
    args: toMessages([{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min + 4,
    }]),
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }]),
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
        index: limits.message.index.min + 4,
      }]),
    }],
  }, {
    tag: 4,
    args: toMessages([{
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min + 1,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min + 1,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min + 1,
    }]),
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min + 1,
      }]),
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min + 1,
        index: limits.message.index.min + 1,
      }]),
    }],
  }, {
    tag: 5,
    args: toMessages([{
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
      district: limits.message.district.min + 1,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[1],
      district: limits.message.district.min,
      zone: limits.message.zone.min,
      index: limits.message.index.min,
    }]),
    expres: [{
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }]),
    }, {
      zoneid: {
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }])
    }, {
      zoneid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[1],
        district: limits.message.district.min,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }])
    }, {
      zoneid: {
        region: limits.message.region.values[1],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
      },
      messages: toMessages([{
        region: limits.message.region.values[1],
        district: limits.message.district.min + 1,
        zone: limits.message.zone.min,
        index: limits.message.index.min,
      }])
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessagesByZone. Test #${tag}`, () => {
      let result = groupMessagesByZone(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})
