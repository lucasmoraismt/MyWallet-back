import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database.js";

beforeEach(async () => {
  await connection.query(
    `DELETE FROM users WHERE name = 'teste' AND email = 'teste@teste.com'`
  );
});

afterAll(async () => {
  await connection.query(
    `DELETE FROM users WHERE name = 'teste' AND email = 'teste@teste.com'`
  );
  connection.end();
});

describe("POST /signup", () => {
  it("returns status 201 for valid params", async () => {
    const body = {
      name: "teste",
      email: "teste@teste.com",
      password: "123456",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(201);
  });

  it("returns status 409 for conflict sign-up", async () => {
    const body = {
      name: "teste",
      email: "teste@teste.com",
      password: "123456",
    };
    await supertest(app).post("/sign-up").send(body);
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(409);
  });

  it("returns status 400 for invalid params", async () => {
    const body = {
      name: "  ",
      email: "teste@teste.com",
      password: "123456",
    };
    const result = await supertest(app).post("/sign-up").send(body);
    expect(result.status).toEqual(400);
  });
});

describe("POST /signin", () => {
  it("returns user and token for valid params", async () => {
    const body1 = {
      email: "teste@teste.com",
      password: "123456",
    };
    const body2 = {
      name: "teste",
      email: "teste@teste.com",
      password: "123456",
    };

    await supertest(app).post("/sign-in").send(body2);
    const result = await supertest(app).post("/sign-in").send(body1);

    expect.objectContaining({
      user: expect.any(Array),
      token: expect.any(String),
    });
  });

  it("returns status 404 for non-existing user", async () => {
    const body = {
      email: "teste@teste.com",
      password: "123456",
    };

    const result = await supertest(app).post("/sign-in").send(body);

    expect(result.status).toEqual(404);
  });

  it("returns status 400 for invalid params", async () => {
    const body1 = {
      email: "    ",
      password: "123456",
    };
    const body2 = {
      name: "teste",
      email: "teste@teste.com",
      password: "123456",
    };

    await supertest(app).post("/sign-up").send(body2);
    const result = await supertest(app).post("/sign-in").send(body1);

    expect(result.status).toEqual(400);
  });

  it("returns status 401 for invalid password", async () => {
    const body1 = {
      email: "teste@teste.com",
      password: "12345",
    };
    const body2 = {
      name: "teste",
      email: "teste@teste.com",
      password: "123456",
    };

    await supertest(app).post("/sign-up").send(body2);
    const result = await supertest(app).post("/sign-in").send(body1);

    expect(result.status).toEqual(401);
  });
});
