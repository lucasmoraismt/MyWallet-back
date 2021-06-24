import express from "express";
import cors from "cors";
import pg from "pg";

import validateSignUp from "./helpers/validateSignUp";

const { Pool } = pg;
const app = express();
app.use(express.json());
app.use(cors());

const connection = new Pool({
  user: "postgres",
  password: "123456",
  host: "localhost",
  port: 5432,
  database: "my_wallet",
});

app.post("/sign-up", async (req, res) => {
  const validation = validateSignUp(req.body);

  if (validation.status) {
    return res.sendStatus(validation.status);
  }

  await connection.query(
    `
  INSERT INTO users (name, email, password) VALUES ($1, $2, $3)
  `,
    [req.body.name, req.body.email, password]
  );

  res.send(token);
});

app.listen(4000);
