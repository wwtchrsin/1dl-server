import * as conn from "../conn"
import * as users from "../users"
import { databaseErrors } from "../../error-messages"

let userid = "53e291f8-522b-43b8-a5f5-84795b887a81"
let login = "12345678"

describe("testing database queries...", () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  test("Function useridExists. Test #1", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ userid }] })
    let result = await users.useridExists(userid)
    expect(result).toStrictEqual({ error: undefined, data: true })
  })
  test("Function useridExists. Test #2", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [] })
    let result = await users.useridExists(userid)
    expect(result).toStrictEqual({ error: undefined, data: false })
  })
  test("Function useridExists. Test #3", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue({ rows: [{ userid }, { userid }] })
    let result = await users.useridExists(userid)
    expect(result).toStrictEqual({ error: databaseErrors.checkUserExists, data: undefined })
  })
  test("Function useridExists. Text #4", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue(undefined)
    let result = await users.useridExists(userid)
    expect(result).toStrictEqual({ error: databaseErrors.checkUserExists, data: undefined })
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
    expect(result).toStrictEqual({ error: databaseErrors.checkUserExists, data: undefined })
  })
  test("Function loginExists. Text #4", async () => {
    jest.spyOn(conn, "queryDatabase").mockResolvedValue(undefined)
    let result = await users.loginExists(login)
    expect(result).toStrictEqual({ error: databaseErrors.checkUserExists, data: undefined })
  })
})
