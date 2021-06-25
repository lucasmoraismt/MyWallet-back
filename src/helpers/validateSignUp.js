import joi from "joi";

export default function validateSignUp(name, email, password) {
  const schema = joi.object({
    name: joi.string().min(1).required(),
    email: joi.string().min(3).required(),
    password: joi.string().min(1).required(),
  });

  const validation = schema.validate({ name, email, password });
  const returnObject = {};

  if (!!validation.error) {
    returnObject["status"] = 400;
    return returnObject;
  }
  if (name.trim().length === 0 || email.trim().length === 0) {
    returnObject["status"] = 400;
    return returnObject;
  }

  return returnObject;
}
