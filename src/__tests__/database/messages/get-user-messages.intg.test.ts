process.env.PG_SCHEMA = "getUserMessagesTest"

import { pool, queryDatabase } from "../../../lib/database/conn"
import { getUserMessages, createMessage } from "../../../lib/database/messages"
import { createProfile } from "../../../lib/database/users"
import { sql } from "../../../lib/database/schema"
import { limits, patterns, examples } from "../../../lib/database/limits"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let users = [{
  login: examples.login.correct[2],
  password: examples.password.correct[2],
  name: examples.name.correct[2],
}, {
  login: examples.login.correct[3],
  password: examples.password.correct[3],
  name: examples.name.correct[3],
}]

let knownUserids = []

let unknownUserid = examples.uuid[3]

let messages = [[{
  region: examples.region.first,
  district: limits.messages.districtMin,
  room: limits.messages.roomMin,
  index: limits.messages.indexMin,
  text: examples.text.correct[0],
  color: examples.color.first,
}, {
  region: examples.region.first,
  district: limits.messages.districtMax,
  room: limits.messages.roomMax,
  index: limits.messages.indexMax,
  text: examples.text.correct[1],
  color: examples.color.last,
}], [{
  region: examples.region.last,
  district: limits.messages.districtMin + 1,
  room: limits.messages.roomMin + 1,
  index: limits.messages.indexMin + 1,
  text: examples.text.correct[2],
  color: examples.color.first,
}]]

describe("testing database queries...", () => {
  test("Function createMessage. Preparing database...", async () => {
    for ( let userData of users ) {
      let result = await createProfile(userData)
      expect(result.error).toBeUndefined()
      expect(result.data).toBeDefined()
      expect(result.data.userid).toMatch(patterns.uuid)
      knownUserids.push(result.data.userid)
    }
    for ( let i=0; i < messages.length; i++ ) {
      for ( let j=0; j < messages[i].length; j++ ) {
        let result = await createMessage(knownUserids[i], messages[i][j])
        expect(result.error).toBeUndefined()
        expect(result.data).toBeDefined()
        expect(result.data.timestamp).toMatch(patterns.timestamp)
        messages[i][j].timestamp = result.data.timestamp
      }
    }
  })
  let testcases = [{
    tag: 1,
    args: () => knownUserids[0],
    expres: {
      error: undefined,
      data: messages[0],
    },
  }, {
    tag: 2,
    args: () => knownUserids[1],
    expres: {
      error: undefined,
      data: messages[1],
    },
  }, {
    tag: 3,
    args: () => unknownUserid,
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: () => "abcd",
    expres: {
      error: "wrongValues.users.userid",
      data: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getUserMessages. Intg Test ${tag}`, async () => {
      let result = await getUserMessages(args())
      expect(result).toStrictEqual(expres)
    })
  }
})

      
