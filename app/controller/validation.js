// Require Validators
const { validationResult } = require('express-validator');

const errorFormatter = ({ location, msg, param, value, nestedErrors }) => {
    // Build your resulting errors however you want! String, object, whatever - it works!
    // Response will contain something like
    // { errors: [ "password: must be at least 10 chars long" ] }
    return `${param}: ${msg}`;
};

module.exports.validationResult = validationResult;
module.exports.errorFormatter = errorFormatter;