import { getLocation } from "../../../lib/ws/miscs"
import type { Location } from "../../../lib/database/interfaces"

describe("testing auxilliary functions...", () => {
  let testcases = [{
    tag: 1,
    args: {
      region: "foo",
    },
    expres: `/foo`,
  }, {
    tag: 2,
    args: {
      region: "foo",
      tag: "bar",
    },
    expres: `/foo/bar`,
  }, {
    tag: 3,
    args: {
      region: "foo",
      tag: "bar",
      index: 1,
    },
    expres: "/foo/bar",
  }, {
    tag: 4,
    args: {
      region: "bar",
      bar: "baz",
    },
    expres: "/bar",
  }, {
    tag: 5,
    args: {
      tag: "bar",
      index: 1,
    },
    expres: "",
  }, {
    tag: 6,
    args: {},
    expres: "",
  }, {
    tag: 7,
    args: undefined,
    expres: "",
  }]
  for ( let testcase of testcases ) {
    let { tag, args, expres } = testcase
    test(`Function getLocation. Test #${tag}`, () => {
      let result = getLocation(args)
      expect(result).toBe(expres)
    })
  }
})

