import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database.js";

describe("POST /sign-up", () => {
  it("returns status 201 for valid params", async () => {
    const body = {};
    const result = await supertest(app).get("/sign-up");

    expect(result.status).toEqual(201);
  });

  it("returns status 409 for duplicated email", async () => {
    const body = {};

    await supertest(app).get("/sign-up");
    const result = await supertest(app).get("/sign-up");

    expect(result.status).toEqual(409);
  });
});
