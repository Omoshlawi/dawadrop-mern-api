const Joi = require("joi");

const orderSchema = Joi.object({
  patient: Joi.string().required().label("Patient"),
  appointment: Joi.string().required().label("Appointment"),
  deliveryAddress: Joi.object({
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    address: Joi.string().label("Address"),
  })
    .label("Delivery address")
    .required(),
  deliveryTimeSlot: Joi.object({
    startTime: Joi.date().required().label("Start time"),
    endTime: Joi.date().required().label("End time"),
  })
    .label("Time between")
    .required(),
  deliveryMode: Joi.string().required().label("Delivery mode"),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{9,14}$/)
    .label("Phone number")
    .messages({
      "string.pattern.base": "Invalid phone number format",
    }),
  drug: Joi.string().label("Drug").required(),
});

const patientOrderSchema = Joi.object({
  deliveryAddress: Joi.object({
    latitude: Joi.number().required().label("Latitude"),
    longitude: Joi.number().required().label("Longitude"),
    address: Joi.number().label("Address"),
  }).label("Delivery address"),
  deliveryTimeSlot: Joi.object({
    startTime: Joi.date().required().label("Start time"),
    endTime: Joi.date().required().label("End time"),
  }).label("Time between"),
  deliveryMode: Joi.string().required().label("Delivery mode"),
  phoneNumber: Joi.string().max(14).min(9).label("Phone number"),
});

exports.orderValidator = async (data) => {
  return await orderSchema.validateAsync(data, { abortEarly: false });
};
exports.patientOrderValidator = async (data) => {
  return await patientOrderSchema.validateAsync(data, { abortEarly: false });
};