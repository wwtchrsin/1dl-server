import supertest from "supertest"
import httpServer from "../../../http-server"
import { limits } from "../../../lib/database/limits"
import env from "../../../lib/env"

let testServer = supertest(httpServer)

describe("testing endpoints...", () => {
  test("GET /app/limits. Test #1", async () => {
    let url = "/api/v1/app/limits"
    let auth = `Bearer ${env.serviceid}:`
    let result = await testServer.get(url).set("Authorization", auth)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBeDefined()
    expect(result.body.error).toBeUndefined()
    expect(result.body.limits).toBeDefined()
    expect(result.body.limits).toStrictEqual(limits)
  })
})
