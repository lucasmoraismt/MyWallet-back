import joi from "joi";
import connection from "../database.js";

export default async function validateSignUp(email, password) {
  const schema = joi.object({
    email: joi.string().min(3).required(),
    password: joi.string().min(1).required(),
  });

  const validation = schema.validate({ email, password });
  const returnObject = {};

  if (!!validation.error) {
    returnObject["status"] = 400;
    return returnObject;
  }
  if (email.trim().length === 0) {
    returnObject["status"] = 400;
    return returnObject;
  }

  const request = await connection.query(
    `SELECT * FROM users WHERE email = $1`,
    [email]
  );

  if (request.rows.length === 0) {
    returnObject["status"] = 404;
    return returnObject;
  }

  return returnObject;
}
