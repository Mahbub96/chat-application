// external imports
const express = require("express");

// internal imports
const {
  getInbox,
  searchUser,
  addConversation,
  getMessages,
  sendMessage,
} = require("../controllers/inboxController");
const decorateHtmlResponse = require("../middlewares/common/decorateHtmlResponse");
const { checkLogin } = require("../middlewares/common/checkLogin.js");
const attachmentUpload = require("../middlewares/inbox/attachmentUpload");

const router = express.Router();

// inbox page
router.get("/", decorateHtmlResponse("Inbox"), checkLogin, getInbox);

// search user
router.post("/search", checkLogin, searchUser);

// add Conversation
router.post("/conversation", checkLogin, addConversation);

// get messages of a Conversation
router.get("/messages/:conversation_id", checkLogin, getMessages);

// send Message
router.post("/message", checkLogin, attachmentUpload, sendMessage);

module.exports = router;
