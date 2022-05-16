const Joi = require('joi')

const logByIdSchema = Joi.object({
  id: Joi.number().integer()
})

const addLogSchema = Joi.object({
  pet_id: Joi.number().required(),
  description: Joi.string().required(),
  status: Joi.string().required()
})

module.exports = { logByIdSchema, addLogSchema }
