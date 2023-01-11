const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require("./config/db");
const express = require('express');
var cors = require('cors');
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
const app = express();
// accepting json data
app.use(express.json());
app.use(cors());
// cross origin headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/message", messageRoutes);
// call functions from error middleware dealing with non existent urls
app.use(notFound);
app.use(errorHandler);
// PORT is what is in the ENV file
const PORT = process.env.PORT;
// deployment
if (process.env.NODE_ENV === 'production') {
  //*Set static folder up in production
  app.use(express.static('frontend/build'));

  app.get('*', (req,res) => res.sendFile(path.resolve(__dirname, 'frontend', 'build','index.html')));
} else {
  app.get("/", (req, res) => {
    res.send("API is running..");
  });
}

// SOCKET IO: https://socket.io/get-started/chat
/*Sockets have traditionally been the solution around which 
most real-time chat systems are architected, providing a bi-directional 
communication channel between a client and a server.
This means that the server can push messages to clients. 
Whenever you write a chat message, the idea is that the server will get 
it and push it to all other connected clients.
This is used for the real time messaging between users
*/ 

const server = app.listen(
    PORT,
    console.log(`Server running on PORT ${PORT}...`)
  );

const io = require("socket.io")(server, {
  // amount of time it will wait while being inactive
  pingTimeout: 60000,
  // cors to stop any cross orgin issues
  cors: {
    origin: ["http://localhost:3000", "https://chatify-b5yp.onrender.com"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    // create a room for the user
    socket.join(userData._id);
    // 
    socket.emit("connected");
  });
  // join chat taking room id from the frontend
  socket.on("join chat", (room) => {
    // create a room with id of room
    socket.join(room);
    console.log("User Joined Room: " + room);
  });
  socket.on("typing", (room) => socket.in(room).emit("typing"));
  socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;

      socket.in(user._id).emit("message recieved", newMessageRecieved);
    });
  });

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

