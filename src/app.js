import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import connection from "./database.js";

import validateSignUp from "./helpers/validateSignUp.js";
import validateSignIn from "./helpers/validateSignIn.js";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/sign-up", async (req, res) => {
  const { name, email, password } = req.body;
  const validation = validateSignUp(name, email, password);

  if (validation.status) {
    return res.sendStatus(validation.status);
  }

  const passwordHash = bcrypt.hashSync(password, 12);

  const request = await connection.query(
    `
      INSERT INTO users (name, email, password) 
      SELECT $1, $2, $3
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = $2)
    `,
    [name, email, passwordHash]
  );

  if (request.rowCount > 0) {
    res.sendStatus(201);
  } else {
    res.sendStatus(409);
  }
});

app.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;
  const validation = validateSignIn(email, password);

  if (validation.status) {
    return res.sendStatus(validation.status);
  }

  try {
    const result = await connection.query(
      `
        SELECT * FROM users
        WHERE email = $1
    `,
      [email]
    );

    const user = result.rows[0];

    if (user && bcrypt.compareSync(password, user.password)) {
      const token = uuid();

      await connection.query(
        `
          INSERT INTO sessions ("userId", token)
          VALUES ($1, $2)
        `,
        [user.id, token]
      );

      res.send({ user, token });
    } else {
      if (!user) {
        res.sendStatus(404);
      } else {
        res.sendStatus(401);
      }
    }
  } catch {
    res.sendStatus(500);
  }
});

app.get("/finance", async (req, res) => {
  const { token } = req.body;
  if (!token || token.length === 0) {
    res.sendStatus(400);
  }
  try {
    const tokenQuery = await connection.query(
      `SELECT * FROM sessions WHERE token = $1`,
      [token]
    );

    if (tokenQuery.rows.length === 0) {
      return res.sendStatus(401);
    }

    const finance = await connection.query(
      `SELECT * FROM finance WHERE "userId" = $1`,
      [tokenQuery.rows[0].userId]
    );

    res.send(finance.rows);
  } catch {
    res.sendStatus(500);
  }
});

app.delete("/sessions", async (req, res) => {
  const { token } = req.body;

  if (!token || token.length === 0) {
    res.sendStatus(400);
  }
  try {
    const request = await connection.query(
      `DELETE FROM sessions WHERE token = $1`,
      [token]
    );

    res.sendStatus(200);
  } catch {
    res.sendStatus(500);
  }
});

export default app;
