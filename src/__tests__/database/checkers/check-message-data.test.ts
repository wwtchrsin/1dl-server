import { checkMessageData } from "../../../lib/database/checkers"
import { limits } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

describe("testing query validators...", () => {
  let testcases = [{
    tag: 1,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.minLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: undefined,
  }, {
    tag: 2,
    args: {
      uuid: examples.uuid[1],
      messageid: {
        region: examples.region.last,
        tag: examples.tag.maxLen,
        index: `${limits.message.index.max}`,
      },
      content: {
        text: examples.text.maxLen,
        color: examples.color.last,
      }
    },
    expres: undefined,
  }, {
    tag: 3,
    args: {
      uuid: "abcd",
      messageid: {
        region: examples.region.first,
        tag: examples.tag.minLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.user.userid",
  }, {
    tag: 4,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: "abcd",
        tag: examples.tag.minLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.region",
  }, {
    tag: 5,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.tooShort,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.tag",
  }, {
    tag: 6,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.tooLong,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.tag",
  }, {
    tag: 7,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.wrongSymbols,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.tag",
  }, {
    tag: 8,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.minLen,
        index: `${limits.message.index.min - 1}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.index",
  }, {
    tag: 9,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.minLen,
        index: `${limits.message.index.max + 1}`,
      },
      content: {
        text: examples.text.minLen,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.index",
  }, {
    tag: 10,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.tooShort,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.text",
  }, {
    tag: 11,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.tooLong,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.text",
  }, {
    tag: 12,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.wrongSymbols,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.text",
  }, {
    tag: 13,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.consecutiveSpaces,
        color: examples.color.first,
      }
    },
    expres: "wrongValue.message.text",
  }, {
    tag: 14,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.first,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min}`,
      },
      content: {
        text: examples.text.minLen,
        color: "Abcd",
      }
    },
    expres: "wrongValue.message.color",
  }, {
    tag: 15,
    args: {
      uuid: examples.uuid[0],
      messageid: {
        region: examples.region.some,
        tag: examples.tag.regLen,
        index: `${limits.message.index.min + 1}`,
      },
      content: {
        text: examples.text.regLen,
        color: examples.color.some,
      }
    },
    expres: undefined,
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function checkMessageData. Test #${tag}`, () => {
      let { uuid, messageid, content } = args
      let result = checkMessageData(uuid, messageid, content)
      expect(result).toBe(expres)
    })
  }
})


