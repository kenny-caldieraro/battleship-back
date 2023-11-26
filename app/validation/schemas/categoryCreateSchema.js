const Joi = require('joi');

module.exports = Joi.object({
    label: Joi.string().required(),
    route: Joi.string()
        .pattern(/^\/[a-zA-Z\\/]*[^\\/]$/)
        .required(),
}).required();
