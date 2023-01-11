const mongoose = require('mongoose')
// this schema is for a message
const messageSchema = mongoose.Schema({
        sender: {
            // using id and ref User model
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        content: {
            // trim cuts out any spaces before or after the name in the string
            // removing any whitespace on frontend and in db
            type: String,
            trim: true
        },
        chat: {
            // using id and ref User model
            type: mongoose.Schema.Types.ObjectId,
            ref: "Chat"
        },
        readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    }, {
        // mongoose to create time stamp when new data is added
        timestamps: true
    }

);

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;