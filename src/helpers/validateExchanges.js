import joi from "joi";
import connection from "../database.js";

export default async function validateExchanges(
  userId,
  type,
  text,
  value,
  token
) {
  const schema = joi.object({
    userId: joi.number().min(1).required(),
    type: joi.string().min(1).required(),
    text: joi.string().min(1).required(),
    value: joi.number().positive().required(),
    token: joi.string().min(1).required(),
  });

  const validation = schema.validate({ userId, type, text, value, token });
  const returnObject = {};

  if (!!validation.error) {
    returnObject["status"] = 400;
    return returnObject;
  }

  const request = await connection.query(
    `SELECT * FROM sessions WHERE token = $1`,
    [token]
  );

  if (request.rows.length === 0) {
    returnObject["status"] = 401;
  }

  return returnObject;
}
