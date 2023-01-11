const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  removeFromGroup,
  addToGroup,
  renameGroup,
} = require("../controllers/chatControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();
// post requests for accessing or creating a chat
// only logged in users can do this
router.route("/").post(protect, accessChat);
// get request for fetching chats for logged in user
router.route("/").get(protect, fetchChats);
// post request for creation of group chats
router.route("/group").post(protect, createGroupChat);
// put request for renaming group chats
router.route("/rename").put(protect, renameGroup);
// remove someone from a group or leave a group chat
router.route("/groupremove").put(protect, removeFromGroup);
// put request to add someone to a group chat
router.route("/groupadd").put(protect, addToGroup);

module.exports = router;
