import supertest from "supertest"
import httpServer from "../../../http-server"
import { errorMessages } from "../../../lib/error-messages"
import env from "../../../lib/env"

let testServer = supertest(httpServer)

describe("testing endpoints...", () => {
  test("GET /app/messages. Test #1", async () => {
    let url = "/api/v1/app/messages"
    let auth = `Bearer ${env.serviceid}:`
    let result = await testServer.get(url).set("Authorization", auth)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBeDefined()
    expect(result.body.error).toBeUndefined()
    expect(result.body.messages).toBeDefined()
    expect(result.body.messages).toStrictEqual(errorMessages)
  })
})
