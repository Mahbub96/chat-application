// external imports
const express = require("express");

// internal imports
const {
  getSignup,
  getLogin,
  login,
  logout,
  signup,
} = require("../controllers/loginController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const {
  doLoginValidationHandler,
  doLoginValidators,
  doSignupValidators,
  doSignupValidationHandler,
} = require("../middlewares/login/loginValidator");
const { redirectLoggedIn } = require("../middlewares/common/checkLogin");

const router = express.Router();

// set page title
const page_title = "Login";

// login page
router.get("/", decorateHtmlResponse(page_title), redirectLoggedIn, getLogin);
router.get("/signup", decorateHtmlResponse(page_title), getSignup);
// process login
router.post(
  "/",
  decorateHtmlResponse(page_title),
  doLoginValidators,
  doLoginValidationHandler,
  login
);

router.post(
  "/signup",
  decorateHtmlResponse(page_title),
  doSignupValidators,
  doSignupValidationHandler,
  signup
);

router.delete("/", logout);

module.exports = router;
