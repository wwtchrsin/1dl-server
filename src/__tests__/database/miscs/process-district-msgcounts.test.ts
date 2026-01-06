import { processDistrictMsgcounts } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      district: limits.messages.districtMin,
      msgcount: 5,
    }],
    expres: {
      [limits.messages.districtMin]: 5,
    },
  }, {
    tag: 2,
    args: [{
      district: limits.messages.districtMin + 1,
      msgcount: 5,
    }],
    expres: {
      [limits.messages.districtMin + 1]: 5,
    },
  }, {
    tag: 3,
    args: [{
      district: limits.messages.districtMin + 2,
      msgcount: 2,
    }, {
      district: limits.messages.districtMin,
      msgcount: 1,
    }, {
      district: limits.messages.districtMax - 2,
      msgcount: 3,
    }, {
      district: limits.messages.districtMax,
      msgcount: 4,
    }],
    expres: {
      [limits.messages.districtMin + 2]: 2,
      [limits.messages.districtMin]: 1,
      [limits.messages.districtMax - 2]: 3,
      [limits.messages.districtMax]: 4,
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
