const mongoose = require('mongoose')
// this message is for the chats
const chatModel = mongoose.Schema({
        // trim cuts out any spaces before or after the name in the string
        // removing any whitespace on frontend and in db
        chatName: {
            type: String,
            trim: true
        },
        // for group chats - by default chats are not group chats
        isGroupChat: {
            type: Boolean,
            default: false
        },
        users: [{
            // containing the ID of the user
            type: mongoose.Schema.Types.ObjectId,
            // user model as reference
            ref: "User",
        }],
        latestMessage: {
            // containing the ID of the user
            type: mongoose.Schema.Types.ObjectId,
            // Messages model as reference
            ref: "Message",
        },
        groupAdmin: {
            // containing the ID of the user
            type: mongoose.Schema.Types.ObjectId,
            // user model as reference
            ref: "User",
        }
    },
    // mongoose to create time stamp when new data is added
    {
        timestamps: true,
    }
);

const Chat = mongoose.model("Chat", chatModel);

module.exports = Chat;