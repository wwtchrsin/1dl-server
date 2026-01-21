import supertest from "supertest"
import httpServer from "../../../http-server"
import { errorMessages } from "../../../lib/error-messages"

let testServer = supertest(httpServer)

describe("testing endpoints...", () => {
  test("GET /app/messages. Test #1", async () => {
    let url = "/api/v1/app/messages"
    let result = await testServer.get(url)
    expect(result.statusCode).toBe(200)
    expect(result.body).toBeDefined()
    expect(result.body.error).toBeUndefined()
    expect(result.body.messages).toBeDefined()
    expect(result.body.messages).toStrictEqual(errorMessages)
  })
})
