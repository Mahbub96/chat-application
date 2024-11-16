const { check, validationResult } = require("express-validator");

const doLoginValidators = [
  check("username")
    .isLength({ min: 1 })
    .withMessage("Mobile or email is Required!"),
  check("password").isLength({ min: 1 }).withMessage("Password is Required"),
];

const doSignupValidators = [
  check("name").isLength({ min: 1 }).withMessage("Name is Required!"),
  check("email").isEmail().withMessage("Invalid email address!"),
  check("mobile").isMobilePhone("bn-BD").withMessage("Invalid mobile number!"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long!"),
];

const doLoginValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.render("index", {
      data: {
        username: req.body.username,
      },
      errors: mappedErrors,
    });
  }
};

const doSignupValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();

  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    res.render("signup", {
      data: req.body,
      errors: mappedErrors,
    });
  }
};

module.exports = {
  doLoginValidators,
  doLoginValidationHandler,
  doSignupValidators,
  doSignupValidationHandler,
};
