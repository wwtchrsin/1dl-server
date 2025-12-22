import { pool, schema } from "../../../lib/database/conn"
import { getDistrictStats } from "../../../lib/database/messages"
import { sql } from "../../../lib/database/schema"
import { limits, patterns } from "../../../lib/database/limits"
import { examples, populateDatabase, databaseMessages, databaseDistricts, 
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

let sortStats = (stats: any[]) => {
  return stats.sort((a, b) => +a.room < +b.room ? -1 : 1)
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

describe("testing database queries...", () => {
  let testcases = [{
    tag: 1,
    args: databaseDistricts[0],
    expres: {
      error: undefined,
      data: stats(0),
    },
  }, {
    tag: 2,
    args: databaseDistricts[1],
    expres: {
      error: undefined,
      data: stats(1),
    },
  }, {
    tag: 3,
    args: databaseEmptyDistricts[0],
    expres: {
      error: undefined,
      data: [],
    },
  }, {
    tag: 4,
    args: {
      region: databaseDistricts[0].region,
      district: limits.messages.districtMax + 1,
    },
    expres: {
      error: undefined,
      data: [],
    },
  }]
  for ( let testcase of testcases ) {
    let { args, expres, tag } = testcase
    test(`Function getDistrictStats. Intg Test ${tag}`, async () => {
      let result = await getDistrictStats(args)
      if ( result.data !== undefined ) {
        result.data = sortStats(result.data)
      }
      expect(result).toStrictEqual(expres)
    })
  }
})
    
