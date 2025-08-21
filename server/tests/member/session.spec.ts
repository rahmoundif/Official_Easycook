import supertest from "supertest";
import app from "../../src/app";

describe("GET /session", () => {
  it("returns authenticated false when no token cookie is set", async () => {
    const res = await supertest(app).get("/session");
    expect(res.status).toBe(200);
    expect(res.body?.authenticated).toBe(false);
  });
});
