const express = require("express");
// controller functions for users
const {
  registerUser,
  authUser,
  allUsers,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
// register new user
router.route("/").post(registerUser);
// login user
router.post("/login", authUser);


module.exports = router;