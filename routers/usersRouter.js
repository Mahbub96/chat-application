const express = require("express");

// internal imports
const { getUsers } = require("../controllers/usersController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const avatarUpload = require("../middlewares/users/avatarUpload");

const router = express.Router();

// users page
router.get("/", decorateHtmlResponse("users"), getUsers);

// add user
router.post("/", avatarUpload);

module.exports = router;
