import supertest from "supertest";
import databaseClient from "../../database/client";
import app from "../../src/app";
import type { QueryResult, QueryResultRow } from "pg";

function mockQuery<T extends QueryResultRow>(rows: T[]) {
  jest
    .spyOn(databaseClient, "query")
    .mockImplementation(async () => ({ rows }) as QueryResult<T>);
}

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Public recipe routes", () => {
  it("GET /recipe supports combined filters", async () => {
    mockQuery([]);
    const res = await supertest(app).get("/recipe").query({ category: "Dessert", diet: "Vegan", difficulty: "Easy" });
    expect(res.status).toBe(200);
    expect(res.body).toStrictEqual([]);
  });

  it("GET /recipe/detail/:id returns 404 when not found", async () => {
    mockQuery([]);
    const res = await supertest(app).get("/recipe/detail/999");
    expect(res.status).toBe(404);
  });
});
