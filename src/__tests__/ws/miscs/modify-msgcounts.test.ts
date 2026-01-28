import { modifyMsgcounts } from "../../../lib/ws/miscs"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: {
      groups: [{
        msgcounts: {
          [0]: 0,
        }
      }],
      modifier: (x: number) => x + 1,
    },
    expres: [{
      msgcounts: {
        [0]: 1
      }
    }],
  }, {
    tag: 2,
    args: {
      groups: [{
        msgcounts: {
          [0]: 1,
          [1]: 2,
        }
      }],
      modifier: (x: number) => x + 2,
    },
    expres: [{
      msgcounts: {
        [0]: 3,
        [1]: 4,
      }
    }],
  }, {
    tag: 3,
    args: {
      groups: [{
        msgcounts: {
          [0]: 1,
          [1]: 2,
        }
      }],
      modifier: (x: number) => x * -2,
    },
    expres: [{
      msgcounts: {
        [0]: -2,
        [1]: -4,
      }
    }],
  }, {
    tag: 4,
    args: {
      groups: [{
        msgcounts: {
          [2]: 10,
          [4]: 20,
        }
      }, {
        msgcounts: {
          [3]: 30,
          [5]: 40,
        }
      }],
      modifier: (x: number) => -x + 5,
    },
    expres: [{
      msgcounts: {
        [2]: -5,
        [4]: -15,
      }
    }, {
      msgcounts: {
        [3]: -25,
        [5]: -35,
      }
    }],
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function modifyMsgcounts. Test #${tag}`, () => {
      let { groups, modifier } = args
      modifyMsgcounts(groups, modifier)
      expect(groups).toStrictEqual(expres)
    })
  }
})