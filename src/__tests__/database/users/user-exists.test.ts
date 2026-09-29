import * as conn from "../../../lib/database/conn"
import * as users from "../../../lib/database/users"
import { examples } from "../../../lib/test-data"

let login = examples.login.correct[0]
let name = examples.name.correct[0]

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("Function userExists. Test #1", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ login, name }] })
    let result = await users.userExists(login, name)
    expect(result).toStrictEqual({ error: undefined, data: true })
  })
  test("Function userExists. Test #2", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [] })
    let result = await users.userExists(login, name)
    expect(result).toStrictEqual({ error: undefined, data: false })
  })
  test("Function userExists. Test #3", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ login, name }, { login, name }] })
    let result = await users.userExists(login, name)
    expect(result).toStrictEqual({ error: "databaseError.checkUserExists", data: undefined })
  })
  test("Function userExists. Text #4", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue(undefined)
    let result = await users.userExists(login, name)
    expect(result).toStrictEqual({ error: "databaseError.checkUserExists", data: undefined })
  })
})
