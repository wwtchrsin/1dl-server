import { getLocation, getRoomLocation, getDistrictLocation,
  getRegionLocation } from "../../../lib/ws/miscs"
import { limits } from "../../../lib/database/limits"
import type { Districtid, Roomid } from "../../../lib/database/interfaces"

describe("testing auxilliary functions...", () => {
  let testcases = {
    getLocation: [{
      tag: 1,
      args: {
        region: "foo",
      },
      expres: `/foo`,
    }, {
      tag: 2,
      args: {
        region: "foo",
        district: 1,
      },
      expres: `/foo/1`,
    }, {
      tag: 3,
      args: {
        region: "foo",
        district: 1,
        room: 1,
      },
      expres: "/foo/1/1",
    }, {
      tag: 4,
      args: {
        region: "foo",
        district: 1,
        room: 1,
        index: 1,
      },
      expres: "/foo/1/1",
    }, {
      tag: 5,
      args: {
        region: "foo",
        district: 1,
        room: 1,
        bar: 1,
      },
      expres: "/foo/1/1",
    }, {
      tag: 6,
      args: {
        region: "bar",
        room: 1,
      },
      expres: "/bar",
    }, {
      tag: 7,
      args: {
        district: 1,
        room: 1,
      },
      expres: "",
    }, {
      tag: 8,
      args: {},
      expres: "",
    }, {
      tag: 9,
      args: undefined,
      expres: "",
    }],
    getRoomLocation: [{
      tag: 1,
      args: {
        region: "foo",
        district: 1,
        room: 1,
      },
      expres: "/foo/1/1",
    }, {
      tag: 2,
      args: {
        region: "foo",
        district: 1,
        room: 1,
        index: 1,
      },
      expres: "/foo/1/1",
    }, {
      tag: 3,
      args: {
        region: "foo",
        district: 1,
      },
      expres: "/foo/1/undefined",
    }, {
      tag: 4,
      args: {
        region: "bar",
        room: 1,
      },
      expres: "/bar/undefined/1",
    }],
    getDistrictLocation: [{
      tag: 1,
      args: {
        region: "foo",
        district: 1,
      },
      expres: "/foo/1",
    }, {
      tag: 2,
      args: {
        region: "foo",
        district: 1,
        room: 1,
      },
      expres: "/foo/1",
    }, {
      tag: 3,
      args: {
        region: "bar",
        room: 1,
        index: 1,
      },
      expres: "/bar/undefined",
    }, {
      tag: 4,
      args: {},
      expres: "/undefined/undefined",
    }],
    getRegionLocation: [{
      tag: 1,
      args: {
        region: "foo",
      },
      expres: "/foo",
    }, {
      tag: 2,
      args: {
        region: "foo",
        district: 1,
      },
      expres: "/foo",
    }, {
      tag: 3,
      args: {},
      expres: "/undefined",
    }],
  }
  for ( let testcase of testcases.getLocation ) {
    let { tag, args, expres } = testcase
    test(`Function getLocation. Test #${tag}`, () => {
      let result = getLocation(args)
      expect(result).toBe(expres)
    })
  }
  for ( let testcase of testcases.getRoomLocation ) {
    let { tag, args, expres } = testcase
    test(`Function getRoomLocation. Test #${tag}`, () => {
      let result = getRoomLocation(args as Roomid)
      expect(result).toBe(expres)
    })
  }
  for ( let testcase of testcases.getDistrictLocation ) {
    let { tag, args, expres } = testcase
    test(`Function getDistrictLocation. Test #${tag}`, () => {
      let result = getDistrictLocation(args as Districtid)
      expect(result).toBe(expres)
    })
  }
  for ( let testcase of testcases.getRegionLocation ) {
    let { tag, args, expres } = testcase
    test(`Function getRegionLocation. Test #${tag}`, () => {
      let result = getRegionLocation(args as Districtid)
      expect(result).toBe(expres)
    })
  }
})

