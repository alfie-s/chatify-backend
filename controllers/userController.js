const User = require('../models/userModel')
const generateToken = require('../config/generateToken')
// search all users
const allUsers = async (req, res) => {
   // using queries to search for user via email or name
   const keyword = req.query.search
     ? {
      // mongodb or operator selecting docs that satisfy at least one of the expresssions
      // if any queries match it will be returned
         $or: [
            // using regex to help filter strings in db
            // "i" to match upper and lower cases in the string
           { name: { $regex: req.query.search, $options: "i" } },
           { email: { $regex: req.query.search, $options: "i" } },
         ],
       }
      //  else not do anything
     : {};
      //  query db, return db of users excluding current user(not equal to user._id)
   const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
   res.send(users);
 };
// register new user
const registerUser = async (req, res) => {
   const { name, email, password, pic } = req.body;
   // if there is no input, throw error
   if (!name || !email || !password ) {
      res.status(400);
      throw new Error('Please enter all the fields')
   }
   // if the email already exists throw error
   const userExists = await User.findOne({ email });

   if (userExists) {
      res.status(400);
      throw new Error('User already exists');
   }
   // create new user
   const user = await User.create({
      name,
      email,
      password,
      pic,
   });
// if the user is ok create user with these params
   if (user) {
      res.status(201).json({
         _id: user._id,
         name: user.name,
         email: user.email,
         pic: user.pic,
         // generate token using user _id from db
         token: generateToken(user._id)
      })
   } else {
      res.status(400);
      throw new Error('Failed to create user');
   }
};
// authorise user
const authUser = async (req, res) => {
   const { email, password } = req.body;
   const user = await User.findOne({ email });
   // if correct user and password return json data
   if (user && (await user.matchPassword(password))) {
     res.json({
       _id: user._id,
       name: user.name,
       email: user.email,
       isAdmin: user.isAdmin,
       pic: user.pic,
       token: generateToken(user._id),
     });
   } else {
     res.status(401);
     throw new Error("Invalid Email or Password");
   }
 };

module.exports = { registerUser, authUser, allUsers };