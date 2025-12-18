process.env.PG_SCHEMA = "getDistrictStatsEndpointTest"

import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, queryDatabase } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, messagesByDistrict,
  databaseMessages, databaseDistricts, databaseEmptyDistricts } 
  from "../../../lib/test-data"
import { getErrorMessage } from "../../../lib/error-messages"
import env from "../../../lib/env"

beforeAll(async () => {
  await pool.query(`CREATE SCHEMA IF NOT EXISTS ${process.env.PG_SCHEMA}`)
  await pool.query(sql.resetTables)
  await pool.query(populateDatabase.addUsers)
  await pool.query(populateDatabase.addMessages)
})

afterAll(async () => {
  await pool.query(`DROP SCHEMA ${process.env.PG_SCHEMA} CASCADE`)
  await pool.end()
})

let testServer = supertest(httpServer)

let sortStats = (stats: any[]) => {
  return stats.sort((a, b) => +a.room < b.room ? -1 : 1)
} 

let stats = (districtIndex: number) => {
  let messageIndices = messagesByDistrict[districtIndex]
  let rooms = new Map()
  for ( let messageIndex of messageIndices ) {
    let room = databaseMessages[messageIndex].room
    if ( !rooms.has(room) ) {
      rooms.set(room, 0)
    }
    rooms.set(room, rooms.get(room) + 1)
  }
  let result = []
  for ( let [room, msgcount] of rooms ) {
    result.push({ room, msgcount })
  }
  return sortStats(result)
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    args: databaseDistricts[0],
    expres: {
      status: 200,
      error: undefined,
      rooms: stats(0),
    },
  }, {
    tag: 2,
    args: databaseDistricts[1],
    expres: {
      status: 200,
      error: undefined,
      rooms: stats(1),
    },
  }, {
    tag: 3,
    args: databaseEmptyDistricts[2],
    expres: {
      status: 200,
      error: undefined,
      rooms: [],
    },
  }, {
    tag: 4,
    args: {
      region: "abcd",
      district: databaseDistricts[0].district,
    },
    expres: {
      status: 400,
      error: "wrongValues.messages.region",
      rooms: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`GET /messages/region/district. Test #${tag}`, async () => {
      let { region, district } = args
      let url = `/api/v1/messages/${region}/${district}`
      let result = await testServer.get(url)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( result.body.rooms !== undefined ) {
        result.body.rooms = sortStats(result.body.rooms)
      }
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.rooms).toStrictEqual(expres.rooms)
      } else {
        let errorMessage = getErrorMessage(expres.error)
        expect(result.body.error).toStrictEqual(errorMessage)
        expect(result.body.rooms).toBeUndefined()
      }
    })
  }
})

