const Joi = require('joi')

const addPetSchema = Joi.object({
  name: Joi.string().trim(),
  age: Joi.number()
    .integer()
    .min(0)
    .max(100),
  clientEmail: Joi.string()
    .email()
    .trim()
    .lowercase(),
  img: Joi.any()
})

const deletePetSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required(),
  clientEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  id: Joi.number().integer()
})

module.exports = { addPetSchema, deletePetSchema }
