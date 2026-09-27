import * as users from "../../../lib/database/users"
import * as conn from "../../../lib/database/conn"
import { patterns } from "../../../lib/database/limits"
import { examples } from "../../../lib/test-data"

let loginDoesntExist = () => {
  return Promise.resolve({ error: undefined, data: false })
}

let loginExists = () => {
  return Promise.resolve({ error: undefined, data: true })
}

let loginCheckError = () => {
  return Promise.resolve({ error: "databaseError.checkUserExists", data: undefined })
}

let requestReturnsUser = (query: string, queryParams: string[]) => {
  let [userid, region, login, password, name, color, state, puid, timestamp] = queryParams
  let user = { 
    userid, region, login, name, color,
    state, puid, timestamp: `${timestamp}`
  }
  return Promise.resolve({ rows: [user] })
}

let requestReturnsZeroUsers = () => {
  return Promise.resolve({ rows: [] })
}

let requestReturnsError = () => {
  return Promise.resolve(undefined)
}

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  let testcases = [{
    tag: 1,
    args: {
      data: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      state: "active",
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsUser,
    },
    expres: "success",
  }, {
    tag: 2,
    args: {
      data: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      state: "active",
    },
    mocks: {
      loginExists: loginExists,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseConflict.loginTaken",
  }, {
    tag: 3,
    args: {
      data: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      state: "active",
    },
    mocks: {
      loginExists: loginCheckError,
      queryDatabase: requestReturnsUser,
    },
    expres: "databaseError.checkUserExists",
  }, {
    tag: 4,
    args: {
      data: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      state: "active",
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsError,
    },
    expres: "databaseError.createProfile",
  }, {
    tag: 5,
    args: {
      data: {
        region: examples.region.first,
        login: examples.login.minLen,
        password: examples.password.minLen,
        name: examples.name.minLen,
      },
      state: "active",
    },
    mocks: {
      loginExists: loginDoesntExist,
      queryDatabase: requestReturnsZeroUsers,
    },
    expres: "databaseError.createProfile",
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag, mocks } = testcase
    test(`Function createProfile. Unit Test #${tag}`, async () => {
      jest.spyOn(users, "loginExists").mockImplementation(mocks.loginExists)
      jest.spyOn(conn, "queryDatabase").mockImplementation(mocks.queryDatabase)
      let result = await users.createProfile(args.data, args.state)
      if ( expres === "success" ) {
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.userid).toMatch(patterns.uuid)
        expect(result.data.region).toBe(args.data.region)
        expect(result.data.login).toBe(args.data.login)
        expect(result.data.name).toBe(args.data.name)
        expect(result.data.color).toBeNull()
        expect(result.data.state).toBe(args.state)
        expect(result.data.puid).toMatch(patterns.uuid)
        expect(result.data.timestamp).toMatch(patterns.timestamp)
      } else {
        expect(result.error).toBe(expres)
        expect(result.data).toBeUndefined()
      }
    })
  }
})

