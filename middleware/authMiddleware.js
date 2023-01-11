const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");
const dotenv = require('dotenv');
dotenv.config();

// auth middleware
const protect = async (req, res, next) => {
  let token;
    // if header contains something and "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
        // remove "Bearer" from token
      token = req.headers.authorization.split(" ")[1];
      //decode token and verify
      const decoded = jwt.verify(token, process.env.SECRET);
        // find the user in db and return without password
      req.user = await User.findById(decoded.id).select("-password");
        // move onto next operation
      next();
      //   if token is incorrect
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }
//   if token is not there
  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};

module.exports = { protect };
