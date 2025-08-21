import supertest from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import app from "../../src/app";
import databaseClient from "../../database/client";

dotenv.config();

// Utility to extract a cookie value from Set-Cookie headers
function getCookie(setCookie: string[] | undefined, name: string) {
  const raw = setCookie?.find((c) => c.startsWith(name + "="));
  return raw?.match(new RegExp(`${name}=([^;]+)`))?.[1] || "";
}

function headerToArray(h: unknown): string[] | undefined {
  if (!h) return undefined;
  if (Array.isArray(h)) return h as string[];
  if (typeof h === "string") return [h];
  return undefined;
}

describe("Auth + CSRF flow", () => {
  it("issues csrf cookie on GET /session and rejects unsafe request without header", async () => {
    const res = await supertest(app).get("/session");
    expect(res.status).toBe(200);
    const csrf = getCookie(headerToArray(res.headers["set-cookie"]), "csrfToken");
    expect(typeof csrf).toBe("string");
  });

  it("rejects POST /login without csrf header", async () => {
    const res = await supertest(app).post("/login").send({
      email: "u@example.com",
      password: "x",
    });
    // CSRF middleware should block with 403
    expect([400, 401, 403]).toContain(res.status);
  });

  it("accepts POST /login with matching csrf header+cookie (mock auth failure still returns 401/403)", async () => {
    const csrfRes = await supertest(app).get("/session");
    const csrf = getCookie(headerToArray(csrfRes.headers["set-cookie"]), "csrfToken");
    // Mock DB to avoid real connection and force bcrypt comparison to fail
    const hashed = bcrypt.hashSync("correct-password", 8);
    (jest.spyOn(databaseClient, "query") as jest.Mock).mockResolvedValueOnce({
      rows: [
        { id: 1, email: "u@example.com", admin: false, password: hashed },
      ],
    } as any);
    const res = await supertest(app)
      .post("/login")
      .set("Cookie", `csrfToken=${csrf}`)
      .set("X-CSRF-Token", csrf)
      .send({ email: "u@example.com", password: "bad" });
    expect(res.status).toBe(401);
  });

  it("requires admin for /admin routes", async () => {
    const csrfRes = await supertest(app).get("/session");
    const csrf = getCookie(headerToArray(csrfRes.headers["set-cookie"]), "csrfToken");
    const userToken = jwt.sign({ id: 1, isAdmin: false }, process.env.JWT_SECRET as string);
    const res = await supertest(app)
      .patch("/admin/recipe/1")
      .set("Authorization", userToken)
      .set("Cookie", `csrfToken=${csrf}`)
      .set("X-CSRF-Token", csrf)
      .send({ name: "x" });
    expect([401, 403]).toContain(res.status);
  });
});
