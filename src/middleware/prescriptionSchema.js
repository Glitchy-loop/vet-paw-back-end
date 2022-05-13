const Joi = require('joi')

const prescriptionsByIdSchema = Joi.object({
  id: Joi.number().integer()
})

const addPrescriptionSchema = Joi.object({
  medication_id: Joi.number().required(),
  pet_id: Joi.number().required(),
  comment: Joi.string().required()
})

module.exports = { addPrescriptionSchema, prescriptionsByIdSchema }
