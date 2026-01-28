import { processZoneMsgcounts } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      zone: limits.message.zone.min,
      msgcount: 5,
    }],
    expres: {
      [limits.message.zone.min]: 5,
    },
  }, {
    tag: 2,
    args: [{
      zone: limits.message.zone.min + 1,
      msgcount: 5,
    }],
    expres: {
      [limits.message.zone.min + 1]: 5,
    },
  }, {
    tag: 3,
    args: [{
      zone: limits.message.zone.min + 2,
      msgcount: 2,
    }, {
      zone: limits.message.zone.min,
      msgcount: 1,
    }, {
      zone: limits.message.zone.max - 2,
      msgcount: 3,
    }, {
      zone: limits.message.zone.max,
      msgcount: 4,
    }],
    expres: {
      [limits.message.zone.min + 2]: 2,
      [limits.message.zone.min]: 1,
      [limits.message.zone.max - 2]: 3,
      [limits.message.zone.max]: 4,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function processZoneMsgcounts. Test #${tag}`, () => {
      let result = processZoneMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
