import { checkMessageData } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: undefined,
  }, {
    tag: 2,
    args: [
      examples.uuid[1],
      {
        region: examples.region.last,
        district: `${limits.messages.districtMax}`,
        room: `${limits.messages.roomMax}`,
        index: `${limits.messages.indexMax}`,
      },
      {
        text: examples.text.maxLen,
        color: examples.color.last,
      }
    ],
    expres: undefined,
  }, {
    tag: 3,
    args: [
      "abcd",
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.users.userid",
  }, {
    tag: 4,
    args: [
      examples.uuid[0],
      {
        region: "abcd",
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.region",
  }, {
    tag: 5,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin - 1}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.district",
  }, {
    tag: 6,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMax + 1}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.district",
  }, {
    tag: 7,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin - 1}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.room",
  }, {
    tag: 8,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMax + 1}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.room",
  }, {
    tag: 9,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin - 1}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.index",
  }, {
    tag: 10,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMax + 1}`,
      },
      {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.index",
  }, {
    tag: 11,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.tooShort,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.text",
  }, {
    tag: 12,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.tooLong,
        color: examples.color.first,
      }
    ],
    expres: "wrongValues.messages.text",
  }, {
    tag: 13,
    args: [
      examples.uuid[0],
      {
        region: examples.region.first,
        district: `${limits.messages.districtMin}`,
        room: `${limits.messages.roomMin}`,
        index: `${limits.messages.indexMin}`,
      },
      {
        text: examples.text.minLen,
        color: "Abcd",
      }
    ],
    expres: "wrongValues.messages.color",
  }, {
    tag: 14,
    args: [
      examples.uuid[0],
      {
        region: examples.region.some,
        district: `${limits.messages.districtMin + 1}`,
        room: `${limits.messages.roomMin + 1}`,
        index: `${limits.messages.indexMin + 1}`,
      },
      {
        text: examples.text.regLen,
        color: examples.color.some,
      }
    ],
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageData. Test #${tag}`, () => {
      let result = checkMessageData(...args)
      expect(result).toBe(expres)
    })
  }
})


