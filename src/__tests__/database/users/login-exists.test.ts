import * as conn from "../../../lib/database/conn"
import * as users from "../../../lib/database/users"
import { examples } from "../../../lib/test-data"

let login = examples.login.correct[0]

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("Function loginExists. Test #1", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ login }] })
    let result = await users.loginExists(login)
    expect(result).toStrictEqual({ error: undefined, data: true })
  })
  test("Function loginExists. Test #2", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [] })
    let result = await users.loginExists(login)
    expect(result).toStrictEqual({ error: undefined, data: false })
  })
  test("Function loginExists. Test #3", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ login }, { login }] })
    let result = await users.loginExists(login)
    expect(result).toStrictEqual({ error: "databaseError.checkUserExists", data: undefined })
  })
  test("Function loginExists. Text #4", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue(undefined)
    let result = await users.loginExists(login)
    expect(result).toStrictEqual({ error: "databaseError.checkUserExists", data: undefined })
  })
})
