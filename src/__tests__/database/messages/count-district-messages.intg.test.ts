import { pool, schema } from "../../../lib/database/conn"
import { countDistrictMessages } from "../../../lib/database/messages"
import { processZoneMsgcounts as process } from "../../../lib/database/miscs"
import { sql } from "../../../lib/database/schema"
import { limits } from "../../../lib/database/limits"
import { populateDatabase, databaseMessages, databaseDistricts, 
  messagesByDistrict, databaseEmptyDistricts } from "../../../lib/test-data"

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

let stats = (districtIndex: number) => {
  let messageIndices = messagesByDistrict[districtIndex]
  let zones = new Map()
  for ( let messageIndex of messageIndices ) {
    let zone = databaseMessages[messageIndex].zone
    if ( !zones.has(zone) ) {
      zones.set(zone, 0)
    }
    zones.set(zone, zones.get(zone) + 1)
  }
  let result = []
  for ( let [zone, msgcount] of zones ) {
    result.push({ zone, msgcount })
  }
  return result
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: databaseDistricts[0],
    expres: {
      error: undefined,
      data: process(stats(0)),
    },
  }, {
    tag: 2,
    args: databaseDistricts[1],
    expres: {
      error: undefined,
      data: process(stats(1)),
    },
  }, {
    tag: 3,
    args: databaseEmptyDistricts[0],
    expres: {
      error: undefined,
      data: process([]),
    },
  }, {
    tag: 4,
    args: {
      region: databaseDistricts[0].region,
      district: limits.message.district.max + 1,
    },
    expres: {
      error: undefined,
      data: process([]),
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function countDistrictMessages. Intg Test ${tag}`, async () => {
      let result = await countDistrictMessages(args)
      expect(result).toStrictEqual(expres)
    })
  }
})
    
