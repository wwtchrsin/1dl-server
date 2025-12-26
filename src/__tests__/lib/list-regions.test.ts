import { listRegions } from "../../lib/miscs"
import { limits } from "../../lib/database/limits"

let sortList = (list: any[]) => list.sort((a, b) => {
  if ( a.region < b.region ) {
    return -1
  }
  if ( a.region > b.region ) {
    return 1
  }
  return 0
})

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }],
    expres: [
      limits.messages.regions[0],
    ],
  }, {
    tag: 2,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
      room: limits.messages.roomMin + 1,
      index: limits.messages.indexMin + 1,
    }],
    expres: [
      limits.messages.regions[0],
    ],
  }, {
    tag: 3,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }],
    expres: sortList([
      limits.messages.regions[0],
      limits.messages.regions[1],
    ]),
  }, {
    tag: 4,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }],
    expres: sortList([
      limits.messages.regions[0],
      limits.messages.regions[1],
    ]),
  }, {
    tag: 5,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 2,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin + 1,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
    }],
    expres: sortList([
      limits.messages.regions[0],
      limits.messages.regions[1],
    ]),
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function listRegions. Test #${tag}`, async () => {
      let result = listRegions(args)
      expect(sortList(result)).toStrictEqual(expres)
    })
  }
})
    
