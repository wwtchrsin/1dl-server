process.env.PG_SCHEMA = "getUserByCredentialsTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getUserByCredentials, createUser } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import limits from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let correctRequests = []

let wrongRequest = {
  login: "3".repeat(limits.users.LoginLenLim),
  password: "Cc#33333",
}

describe("testing database queries...", () => {
  test("Function getUserBySessionId. Preparing database...", async () => {
    let userdata = [{
      login: "1".repeat(limits.users.loginLenMin),
      password: "Aa!11111",
      name: "1".repeat(limits.users.nameLenMin),
    }, {
      login: "2".repeat(limits.users.loginLenMin),
      password: "Bb@22222",
      name: "2".repeat(limits.users.nameLenMin),
    }]
    for ( let user of userdata ) {
      let result = await createUser(user)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(limits.patterns.uuid)
      expect(result.data.login).toBe(user.login)
      expect(result.data.password).toBeUndefined() 
      expect(result.data.name).toBe(user.name)
      expect(result.data.state).toBeDefined()
      expect(result.data.puid).toMatch(limits.patterns.uuid)
      expect(result.data.timestamp).toMatch(limits.patterns.timestamp)
      correctRequests.push({
        args: {
          login: user.login,
          password: user.password,
        },
        result: result.data,
      })
    }
  })
  let testcases = [{
    tag: 1,
    args: () => correctRequests[0].args,
    expres: () => ({
      error: undefined,
      data: correctRequests[0].result,
    }),
  }, {
    tag: 2,
    args: () => correctRequests[1].args,
    expres: () => ({
      error: undefined,
      data: correctRequests[1].result,
    }),
  }, {
    tag: 3,
    args: () => wrongRequest,
    expres: () => ({
      error: "databaseConflicts.userNotFound",
      data: undefined,
    }),
  }, {
    tag: 4,
    args: () => ({
      login: correctRequests[0].args.login,
      password: correctRequests[1].args.password,
    }),
    expres: () => ({
      error: "databaseConflicts.userNotFound",
      data: undefined,
    }),
  }, {
    tag: 5,
    args: () => ({
      login: correctRequests[1].args.login,
      password: correctRequests[0].args.password,
    }),
    expres: () => ({
      error: "databaseConflicts.userNotFound",
      data: undefined,
    }),
  }, {
    tag: 6,
    args: () => ({
      login: "abcd",
      password: "abcd",
    }),
    expres: () => ({
      error: "databaseConflicts.userNotFound",
      data: undefined,
    }),
  }, {
    tag: 7,
    args: () => ({
      password: "abcd",
    }),
    expres: () => ({
      error: "wrongValues.users.credentialsLogin",
      data: undefined,
    }),
  }, {
    tag: 8,
    args: () => ({
      login: {},
      password: "abcd",
    }),
    expres: () => ({
      error: "wrongValues.users.credentialsLogin",
      data: undefined,
    }),
  }, {
    tag: 9,
    args: () => ({
      login: "abcd",
    }),
    expres: () => ({
      error: "wrongValues.users.credentialsPassword",
      data: undefined,
    }),
  }, {
    tag: 9,
    args: () => ({
      login: "abcd",
      password: {},
    }),
    expres: () => ({
      error: "wrongValues.users.credentialsPassword",
      data: undefined,
    }),
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getUserByCredentials. Intg Test #${tag}`, async () => {
      let result = await getUserByCredentials(args())
      expect(result).toStrictEqual(expres())
    })
  }
})

   
