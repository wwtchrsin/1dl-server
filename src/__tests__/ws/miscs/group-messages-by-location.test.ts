import { groupMessagesByLocation } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import type { Messageid, Message } from "../../../lib/database/interfaces"
import type { MessagesByLocation } from "../../../lib/ws/miscs"

let toMessages = (messageids: Messageid[]): Message[] => {
  let messages: Message[] = []
  for ( let messageid of messageids ) {
    messages.push({
      region: messageid.region,
      tag: messageid.tag,
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

let sortGroups = (groups: MessagesByLocation): MessagesByLocation => {
  groups.sort((a, b) => {
    for ( let param of ["region", "tag"] ) {
      if ( a.location[param] > b.location[param] ) {
        return 1
      }
      if ( a.location[param] < b.location[param] ) {
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
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }]),
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }]),
    }],
  }, {
    tag: 2,
    args: toMessages([{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min + 1,
    }]),
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min + 1,
      }]),
    }],
  }, {
    tag: 3,
    args: toMessages([{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min + 4,
    }]),
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }]),
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
        index: limits.message.index.min + 4,
      }]),
    }],
  }, {
    tag: 4,
    args: toMessages([{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min + 1,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min + 1,
    }]),
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min + 1,
      }]),
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
        index: limits.message.index.min,
      }, {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
        index: limits.message.index.min + 1,
      }]),
    }],
  }, {
    tag: 5,
    args: toMessages([{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[1],
      tag: examples.tag.correct[1],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[1],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }]),
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }]),
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
      },
      messages: toMessages([{
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
        index: limits.message.index.min,
      }])
    }, {
      location: {
        region: limits.message.region.values[1],
        tag: examples.tag.correct[0],
      },
      messages: toMessages([{
        region: limits.message.region.values[1],
        tag: examples.tag.correct[0],
        index: limits.message.index.min,
      }])
    }, {
      location: {
        region: limits.message.region.values[1],
        tag: examples.tag.correct[1],
      },
      messages: toMessages([{
        region: limits.message.region.values[1],
        tag: examples.tag.correct[1],
        index: limits.message.index.min,
      }])
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessagesByLocation. Test #${tag}`, () => {
      let result = groupMessagesByLocation(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})
