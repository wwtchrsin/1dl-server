import { groupMessageidsByLocation } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"
import type { MessageidsByLocation } from "../../../lib/ws/miscs"

let sortGroups = (groups: MessageidsByLocation): MessageidsByLocation => {
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
    groups[i].indices.sort((a, b) => +a - +b)
  }
  return groups
}

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }],
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      indices: [
        limits.message.index.min
      ],
    }],
  }, {
    tag: 2,
    args: [{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min + 1,
    }],
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
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
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min + 4,
    }],
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
      },
      indices: [
        limits.message.index.min + 4,
      ],
    }],
  }, {
    tag: 4,
    args: [{
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min + 2,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min + 2,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[1],
      index: limits.message.index.min + 4,
    }, {
      region: limits.message.region.values[0],
      tag: examples.tag.correct[0],
      index: limits.message.index.min,
    }],
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      indices: [
        limits.message.index.min,
        limits.message.index.min + 2,
      ],
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
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
    }],
    expres: [{
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[0],
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      location: {
        region: limits.message.region.values[0],
        tag: examples.tag.correct[1],
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      location: {
        region: limits.message.region.values[1],
        tag: examples.tag.correct[0],
      },
      indices: [
        limits.message.index.min,
      ],
    }, {
      location: {
        region: limits.message.region.values[1],
        tag: examples.tag.correct[1],
      },
      indices: [
        limits.message.index.min,
      ],
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function groupMessageidsByLocation. Test #${tag}`, () => {
      let result = groupMessageidsByLocation(args)
      expect(sortGroups(result)).toStrictEqual(sortGroups(expres))
    })
  }
})



