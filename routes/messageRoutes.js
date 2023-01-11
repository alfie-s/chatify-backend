const express = require("express");
const {
  allMessages,
  sendMessage,
} = require("../controllers/messageControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// for getting all messages of specific chat
router.route("/:chatId").get(protect, allMessages);
// for sending messages
router.route("/").post(protect, sendMessage);

module.exports = router;
