import supertest from "supertest"
import httpServer from "../../../http-server"
import { pool, schema } from "../../../lib/database/conn"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, databaseZones,
  databaseMessages, messagesByZone, databaseEmptyZones } from "../../../lib/test-data"
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

let sortMessages = (messages: any[]) => {
  return messages.sort((a, b) => +a.timestamp < +b.timestamp ? -1 : 1)
}

let messages = (messageIndices: number[]) => {
  return sortMessages(messageIndices.map((messageIndex) => ({
    region: databaseMessages[messageIndex].region,
    district: databaseMessages[messageIndex].district,
    zone: databaseMessages[messageIndex].zone,
    index: databaseMessages[messageIndex].index,
    text: databaseMessages[messageIndex].text,
    color: databaseMessages[messageIndex].color,
    puid: databaseMessages[messageIndex].puid,
    username: databaseMessages[messageIndex].username,
    timestamp: databaseMessages[messageIndex].timestamp,
  })))
}

describe("testing endpoints...", () => {
  let testcases = [{
    tag: 1,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseZones[0],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByZone[0]),
    },
  }, {
    tag: 2,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseZones[4],
    expres: {
      status: 200,
      error: undefined,
      messages: messages(messagesByZone[4]),
    },
  }, {
    tag: 3,
    auth: `Bearer ${env.serviceid}:`,
    args: databaseEmptyZones[2],
    expres: {
      status: 200,
      error: undefined,
      messages: [],
    },
  }, {
    tag: 4,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: "abcd",
      district: databaseZones[0].district,
      zone: databaseZones[0].zone,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.region",
      messages: undefined,
    },
  }, {
    tag: 5,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseZones[0].region,
      district: limits.message.district.max + 1,
      zone: databaseZones[0].zone,
    },
    expres: {
      status: 400,
      error: "wrongValue.message.district",
      messages: undefined,
    },
  }, {
    tag: 6,
    auth: `Bearer ${env.serviceid}:`,
    args: {
      region: databaseZones[0].region,
      district: limits.message.district.max,
      zone: "abcd",
    },
    expres: {
      status: 400,
      error: "wrongValue.message.zone",
      messages: undefined,
    },
  }, {
    tag: 7,
    auth: `Bearer abcd:`,
    args: databaseZones[0],
    expres: {
      status: 401,
      error: "wrongValue.auth.serviceid",
      messages: undefined,
    },
  }, {
    tag: 8,
    auth: `abcd`,
    args: databaseZones[0],
    expres: {
      status: 401,
      error: "wrongValue.auth.header",
      messages: undefined,
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, auth, tag } = testcase
    test(`GET /messages/r/d/zone. Test #${tag}`, async () => {
      let { region, district, zone } = args
      let url = `/api/v1/messages/${region}/${district}/${zone}` 
      let result = await testServer.get(url).set("Authorization", auth)
      expect(result.statusCode).toBe(expres.status)
      expect(result.body).toBeDefined()
      if ( expres.error === undefined ) {
        expect(result.body.error).toBeUndefined()
        expect(result.body.messages).toStrictEqual(expres.messages)
      } else {
        expect(result.body.error).toBe(expres.error)
        expect(result.body.messages).toBeUndefined()
      }
    })
  }
})



