const Joi = require('joi')

const addMedSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().required()
})

module.exports = { addMedSchema }
