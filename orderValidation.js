const Joi = require('joi');

const orderValidationSchema = Joi.object({
  customer: Joi.string().required(),
  product: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
  price: Joi.number().precision(2).min(0).required(),
});


const validateOrder = (orderData) => {
  return orderValidationSchema.validate(orderData);
};

module.exports = {
  validateOrder,
};