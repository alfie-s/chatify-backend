// import models
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

//Create or fetch One to One Chat
const accessChat = async (req, res) => {
    // if chat with this id exists - return it
  const { userId } = req.body;
    // if user id not in the request
  if (!userId) {
    console.log("UserId param not sent with request");
    return res.sendStatus(400);
  }

  let isChat = await Chat.find({
    isGroupChat: false,
    // $and - both of these requests have to be true
    $and: [
        // searching users array
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    // if chat is found populate users array, minus password
    .populate("users", "-password")
    // populate latest message
    .populate("latestMessage");
    //  populate sender field with latest message and name pic email
  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "name pic email",
  });
    // if the chat exists send first chat
  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    // otherwise create a new chat with these two users
    let chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chatData);
        //  get chat and send it to user, populate user array in db
      const FullChat = await Chat.findOne({ _id: createdChat._id }).populate(
        "users",
        "-password"
      );
      res.status(200).json(FullChat);
    } catch (error) {
      res.status(400);
      throw new Error(error.message);
    }
  }
};

//Fetch all chats for a user
const fetchChats = async (req, res) => {
  try {
    // check which user is logged in and fetch all chats for that user
    Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    // populate these arrays / docs in db that are returned
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
    //   sort from new to old
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, {
          path: "latestMessage.sender",
          select: "name pic email",
        });
        res.status(200).send(results);
      });
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

//Create New Group Chat
const createGroupChat = async (req, res) => {
    // if nothing is entered return message
  if (!req.body.users || !req.body.name) {
    return res.status(400).send({ message: "Please fill all the fields" });
  }
  let users = JSON.parse(req.body.users);
//   if users of group chat is less than 2
  if (users.length < 2) {
    return res
      .status(400)
      .send("More than 2 users are required to form a group chat");
  }
//   push current user to users
  users.push(req.user);

  try {
    // create a new chat with these params
    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
    //   group admin will be user creating the group
      groupAdmin: req.user,
    });
    // populate with the users and group admin, minus password
    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    res.status(200).json(fullGroupChat);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

//Rename Group
const renameGroup = async (req, res) => {
    // chat id and then new name
  const { chatId, chatName } = req.body;
    // find the chat id and update the chat name to the new name
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      chatName: chatName,
    },
    {
      new: true,
    }
  )
//   populate users and group admin
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
// if chat cannot be found
  if (!updatedChat) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(updatedChat);
  }
};

// Remove user from Group
const removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;
  // remove user by id and update
  const removed = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    // check for errors
  if (!removed) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(removed);
  }
};

// Add user to Group / Leave
const addToGroup = async (req, res) => {
  // chat id and user id that we want to add to the chat
  const { chatId, userId } = req.body;
  // update chat details to included added user's id
  const added = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: userId },
    },
    {
      new: true,
    }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
  // check for errors
  if (!added) {
    res.status(404);
    throw new Error("Chat Not Found");
  } else {
    res.json(added);
  }
};

module.exports = {
  accessChat,
  fetchChats,
  createGroupChat,
  renameGroup,
  addToGroup,
  removeFromGroup,
};
