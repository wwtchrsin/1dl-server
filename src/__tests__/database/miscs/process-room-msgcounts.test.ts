import { processRoomMsgcounts } from "../../../lib/database/miscs"
import { limits } from "../../../lib/database/limits"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: [{
      room: limits.message.room.min,
      msgcount: 5,
    }],
    expres: {
      [limits.message.room.min]: 5,
    },
  }, {
    tag: 2,
    args: [{
      room: limits.message.room.min + 1,
      msgcount: 5,
    }],
    expres: {
      [limits.message.room.min + 1]: 5,
    },
  }, {
    tag: 3,
    args: [{
      room: limits.message.room.min + 2,
      msgcount: 2,
    }, {
      room: limits.message.room.min,
      msgcount: 1,
    }, {
      room: limits.message.room.max - 2,
      msgcount: 3,
    }, {
      room: limits.message.room.max,
      msgcount: 4,
    }],
    expres: {
      [limits.message.room.min + 2]: 2,
      [limits.message.room.min]: 1,
      [limits.message.room.max - 2]: 3,
      [limits.message.room.max]: 4,
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
