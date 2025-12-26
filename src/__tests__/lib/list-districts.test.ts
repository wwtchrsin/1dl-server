import { listDistricts } from "../../lib/miscs"
import { limits } from "../../lib/database/limits"

let sortList = (list: any[]) => list.sort((a, b) => {
  if ( a.region < b.region ) {
    return -1
  }
  if ( a.region > b.region ) {
    return 1
  }
  if ( +a.district < +b.district ) {
    return -1
  }
  if ( +a.district > +b.district ) {
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
    expres: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }],
  }, {
    tag: 2,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
      index: limits.messages.indexMin,
    }],
    expres: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
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
    expres: sortList([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 1,
    }]),
  }, {
    tag: 4,
    args: [{
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }],
    expres: sortList([{
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }]),
  }, {
    tag: 5,
    args: [],
    expres: [],
  }, {
    tag: 6,
    args: [{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
      room: limits.messages.roomMin + 1,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 2,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 2,
    }],
    expres: sortList([{
      region: limits.messages.regions[0],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[1],
      district: limits.messages.districtMin,
    }, {
      region: limits.messages.regions[0],
      district: limits.messages.districtMin + 2,
    }])
  }]
  for ( let testcase of testcases ) {
    let  { args, expres, tag } = testcase
    test(`Function listDistricts. Test #${tag}`, async () => {
      let result = listDistricts(args)
      expect(sortList(result)).toStrictEqual(expres)
    })
  }
})
