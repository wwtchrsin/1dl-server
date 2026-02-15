import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let correctData = {
  userid: examples.uuid[2],
  deviceid: examples.sessionid[2],
  prevDeviceid: examples.sessionid[3],
}

let queryDatabase = (query: string, queryParams: string[]) => {
  if ( query.trim().indexOf("DELETE") === 0 ) {
    if ( queryParams[0] !== correctData.userid ) {
      return Promise.resolve(undefined)
    }
    return Promise.resolve({
      rows: [{ deviceid: correctData.prevDeviceid }]
    })
  }
  if ( query.trim().indexOf("INSERT") === 0 ) {
    if ( queryParams[0] !== correctData.userid ) {
      return Promise.resolve(undefined)
    }
  }
  return Promise.resolve({ rowCount: 1 })
}

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      userid: correctData.userid,
      deviceid: correctData.deviceid,
    },
    expres: {
      error: undefined,
      deviceid: correctData.prevDeviceid,
    },
  }, {
    tag: 2,
    args: {
      userid: "abcd",
      deviceid: correctData.deviceid,
    },
    expres: {
      error: "databaseError.deleteSession",
      deviceid: undefined,
    },
  }, {
    tag: 3,
    args: {
      userid: correctData.userid,
      deviceid: "abcd",
    },
    expres: {
      error: undefined,
      deviceid: correctData.prevDeviceid,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function createSession. Unit Test #${tag}`, async () => {
      jest.spyOn(conn, "queryDatabase").mockImplementation(queryDatabase)
      let result = await users.createSession(args.userid, args.deviceid)
      expect(result.error).toBe(expres.error)
      expect(result.deviceid).toBe(expres.deviceid)
      if ( expres.error === undefined ) {
        expect(result.sessionid).toMatch(patterns.sessionid)
      } else {
        expect(result.sessionid).toBeUndefined()
      }
    })
  }
})

    
