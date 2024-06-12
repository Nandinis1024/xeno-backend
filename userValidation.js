const Joi = require('joi');

const userValidationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().trim().min(6).required(),
});


const validateUser = (userData) => {
  return userValidationSchema.validate(userData);
};

module.exports = {
  validateUser,
};