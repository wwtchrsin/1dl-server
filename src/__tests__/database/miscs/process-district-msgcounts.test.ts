import { processDistrictMsgcounts } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      district: limits.message.district.min,
      msgcount: 5,
    }],
    expres: {
      [limits.message.district.min]: 5,
    },
  }, {
    tag: 2,
    args: [{
      district: limits.message.district.min + 1,
      msgcount: 5,
    }],
    expres: {
      [limits.message.district.min + 1]: 5,
    },
  }, {
    tag: 3,
    args: [{
      district: limits.message.district.min + 2,
      msgcount: 2,
    }, {
      district: limits.message.district.min,
      msgcount: 1,
    }, {
      district: limits.message.district.max - 2,
      msgcount: 3,
    }, {
      district: limits.message.district.max,
      msgcount: 4,
    }],
    expres: {
      [limits.message.district.min + 2]: 2,
      [limits.message.district.min]: 1,
      [limits.message.district.max - 2]: 3,
      [limits.message.district.max]: 4,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function processDistrictMsgcounts. Test #${tag}`, () => {
      let result = processDistrictMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
