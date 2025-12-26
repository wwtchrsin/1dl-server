import { processRoomMsgcounts } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      room: limits.messages.roomMin,
      msgcount: 5,
    }],
    expres: {
      [limits.messages.roomMin]: 5,
    },
  }, {
    tag: 2,
    args: [{
      room: limits.messages.roomMin + 1,
      msgcount: 5,
    }],
    expres: {
      [limits.messages.roomMin + 1]: 5,
    },
  }, {
    tag: 3,
    args: [{
      room: limits.messages.roomMin + 2,
      msgcount: 2,
    }, {
      room: limits.messages.roomMin,
      msgcount: 1,
    }, {
      room: limits.messages.roomMax - 2,
      msgcount: 3,
    }, {
      room: limits.messages.roomMax,
      msgcount: 4,
    }],
    expres: {
      [limits.messages.roomMin + 2]: 2,
      [limits.messages.roomMin]: 1,
      [limits.messages.roomMax - 2]: 3,
      [limits.messages.roomMax]: 4,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function processRoomMsgcounts. Test #${tag}`, () => {
      let result = processRoomMsgcounts(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
