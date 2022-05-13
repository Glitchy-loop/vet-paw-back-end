const Joi = require('joi')

const registrationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .required(),
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().required()
})

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  password: Joi.string().required()
})

const changePassSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),
  oldpass: Joi.string().required(),
  newpass: Joi.string().required()
})

const resetPassSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
})

module.exports = {
  registrationSchema,
  loginSchema,
  changePassSchema,
  resetPassSchema
}
