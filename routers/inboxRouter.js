const express = require("express");

// internal imports
const { getInbox } = require("../controllers/inboxController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");

const router = express.Router();

// Inbox page
router.get("/", decorateHtmlResponse("inbox"), getInbox);

module.exports = router;
