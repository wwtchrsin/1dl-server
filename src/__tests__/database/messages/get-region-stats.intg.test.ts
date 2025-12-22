import { pool, schema } from "../../../lib/database/conn"
import { getRegionStats } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, messagesByRegion } 
  from "../../../lib/test-data"

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

let sortStats = (stats: any[]) => {
  return stats.sort((a, b) => +a.district < +b.district ? -1 : 1)
}

let stats = (regionIndex: number) => {
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
  return sortStats(result)
}

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: limits.messages.regions[0],
    expres: {
      error: undefined,
      data: stats(0),
    },
  }, {
    tag: 2,
    args: limits.messages.regions[1],
    expres: {
      error: undefined,
      data: stats(1),
    },
  }, {
    tag: 3,
    args: "abcd",
    expres: {
      error: undefined,
      data: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getRegionStats. Intg Test #${tag}`, async () => {
      let result = await getRegionStats(args)
      if ( result.data !== undefined ) {
        result.data = sortStats(result.data)
      }
      expect(result).toStrictEqual(expres)
    })
  }
})

    


