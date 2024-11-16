// external imports
const createError = require("http-errors");
const jwt = require("jsonwebtoken");

// internal imports
const User = require("../models/People");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const escape = require("../utilities/escape");

// get inbox page
async function getInbox(req, res, next) {
  try {
    const conversations = await Conversation.find({
      $or: [
        { "creator.id": req.user.userid },
        { "participant.id": req.user.userid },
      ],
    }).sort("-last_updated");
    res.locals.data = conversations;
    res.render("inbox");
  } catch (err) {
    next(err);
  }
}

// search user
async function searchUser(req, res, next) {
  const user = req.body.user;
  const searchQuery = user.replace("+88", "");

  const name_search_regex = new RegExp(escape(searchQuery), "i");
  const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");

  try {
    if (searchQuery !== "") {
      let cookies =
        Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
      const token = cookies[process.env.COOKIE_NAME];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const users = await User.find(
        {
          $or: [
            {
              name: name_search_regex,
            },
            {
              mobile: mobile_search_regex,
            },
            {
              email: email_search_regex,
            },
          ],
          _id: { $ne: decoded.userid },
        },
        "name avatar"
      );

      res.json(users);
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// search conversation
async function searchConversation(req, res, next) {
  const name_search_regex = new RegExp(escape(req.body.user), "i");
  // const mobile_search_regex = new RegExp("^" + escape("+88" + searchQuery));
  // const email_search_regex = new RegExp("^" + escape(searchQuery) + "$", "i");
  console.log(name_search_regex);
  try {
    if (req.body.user !== "") {
      // let cookies =
      //   Object.keys(req.signedCookies).length > 0 ? req.signedCookies : null;
      // const token = cookies[process.env.COOKIE_NAME];

      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.find({ name: name_search_regex });
      const conversations = await Conversation.find({
        $or: [
          { "creator.name": name_search_regex },
          { "participant.name": name_search_regex },
        ],
      });

      res.json({ user, conversations });
      console.log();
    } else {
      throw createError("You must provide some text to search!");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// add conversation
async function addConversation(req, res, next) {
  try {
    const isFound = await Conversation.findOne({
      $and: [
        { "creator.id": req.user.userid },
        { "participant.id": req.body.id },
      ],
    });
    if (!isFound) {
      const newConversation = new Conversation({
        creator: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        participant: {
          name: req.body.participant,
          id: req.body.id,
          avatar: req.body.avatar || null,
        },
      });

      const result = await newConversation.save();
      res.status(200).json({
        message: "Conversation was added successfully!",
      });
    } else {
      res.send("Conversation is aready created");
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

// get messages of a conversation
async function getMessages(req, res, next) {
  try {
    const messages = await Message.find({
      conversation_id: req.params.conversation_id,
    }).sort("-createdAt");

    const { participant } = await Conversation.findById(
      req.params.conversation_id
    );

    res.status(200).json({
      data: {
        messages: messages,
        participant,
      },
      user: req.user.userid,
      conversation_id: req.params.conversation_id,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknows error occured!",
        },
      },
    });
  }
}

// send new message
async function sendMessage(req, res, next) {
  if (req.body.message || (req.files && req.files.length > 0)) {
    try {
      // save message text/attachment in database
      let attachments = null;

      if (req.files && req.files.length > 0) {
        attachments = [];

        req.files.forEach((file) => {
          attachments.push(file.filename);
        });
      }

      const newMessage = new Message({
        text: req.body.message,
        attachment: attachments,
        sender: {
          id: req.user.userid,
          name: req.user.username,
          avatar: req.user.avatar || null,
        },
        receiver: {
          id: req.body.receiverId,
          name: req.body.receiverName,
          avatar: req.body.avatar || null,
        },
        conversation_id: req.body.conversationId,
      });

      const result = await newMessage.save();

      // update list time so that last sms sender will be at first position
      const results = await Conversation.updateOne(
        {
          _id: req.body.conversationId,
        },
        { $set: { last_updated: result.date_time } }
      );

      // emit socket event
      global.io.emit("new_message", {
        message: {
          conversation_id: req.body.conversationId,
          sender: {
            id: req.user.userid,
            name: req.user.username,
            avatar: req.user.avatar || null,
          },
          message: req.body.message,
          attachment: attachments,
          date_time: result.date_time,
        },
      });

      res.status(200).json({
        message: "Successful!",
        data: result,
      });
    } catch (err) {
      res.status(500).json({
        errors: {
          common: {
            msg: err.message,
          },
        },
      });
    }
  } else {
    res.status(500).json({
      errors: {
        common: "message text or attachment is required!",
      },
    });
  }
}

module.exports = {
  getInbox,
  searchUser,
  searchConversation,
  addConversation,
  getMessages,
  sendMessage,
};
