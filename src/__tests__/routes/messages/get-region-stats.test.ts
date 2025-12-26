import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase, schema } from "../../../lib/database/conn"
import { processDistrictMsgcounts as process } from "../../../lib/database/miscs"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, messagesByRegion, databaseMessages } 
  from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"
import env from "../../../lib/env"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schema}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${schema} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let msgcounts = (regionIndex: number) => {
  let messageIndices = messagesByRegion[regionIndex]
  let districts = new Map()
  for ( let messageIndex of messageIndices ) {
    let district = databaseMessages[messageIndex].district
    if ( !districts.has(district) ) {
      districts.set(district, 0)
    }
    districts.set(district, districts.get(district) + 1)
  }
  let result = []
  for ( let [district, msgcount] of districts ) {
    result.push({ district, msgcount })
  }
  return result
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    args: limits.messages.regions[0],
    expres: {
      status: 200,
      error: undefined,
      msgcounts: process(msgcounts(0)),
    },
  }, {
    tag: 2,
    args: limits.messages.regions[1],
    expres: {
      status: 200,
      error: undefined,
      msgcounts: process(msgcounts(1)),
    },
  }, {
    tag: 3,
    args: "abcd",
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      msgcounts: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/region. Test #${tag}`, async () => {
      let result = await testServer.get(`/api/v1/messages/${args}`)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.districts).toStrictEqual(expres.districts)
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.districts).toBeUndefined()
      }
    })
  }
})

