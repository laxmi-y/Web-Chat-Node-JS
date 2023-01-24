const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");

const session = require('express-session');
const flash = require('connect-flash');
const ejs = require("ejs") 
const mongoose = require("mongoose")
const homeRouter = require('./routes/home');
const authRouter = require('./routes/auth');
const forgetPassword = require('./routes/forget-password');

const Message = require('./models/message');
const { joinUser, findUser, removeUser } = require('./routes/userInfo');

const passport = require("passport")
const path = require("path")
app.set("view engine", "ejs")

//configure env
const dotenv = require("dotenv");
dotenv.config()

// for show data and read body post data
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

//store session on DB
const MongoDbStore = require('connect-mongo');
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'blablabla',
  store: MongoDbStore.create({
    mongoUrl: "mongodb://localhost:27017/Whatsapp"
})
}));
  
//passport config
const passportInit = require('./config/passport');
passportInit(passport)
app.use(passport.initialize());
app.use(passport.session());

// global meddleware
app.use((req,res,next)=>{
  res.locals.session = req.session
  res.locals.user = req.user
  next()
})

app.use(express.static(path.resolve(__dirname, "public")));

const port = process.env.PORT || 3000;

app.use(flash());
app.use(function(req, res, next){
  res.locals.messages = req.flash();
  next();
});

//database connection
mongoose.connect("mongodb://localhost:27017/Whatsapp").then(
  () => console.log("DB connection success...!!")).catch((err) => {
      console.log(err)
  });


//socket connection 
const io = new Server(server);
let thisRoom = "";

app.get("/messages", async(req,res)=>{
  const messages = await Message.find( { $or: [ { sender : req.user._id }, { receiver: req.user._id } ] } )
  res.send(messages)
})


io.on("connection", function (socket) {
  console.log("connected");
  socket.on("join room", (data) => {
    let Newuser = joinUser(socket.id, data.username, data.roomName)
    socket.emit('send data', { id: socket.id, username: Newuser.username, roomname: Newuser.roomname });
    thisRoom = Newuser.roomname;
    socket.join(Newuser.roomname);
  });

  socket.on("chat message", async(data) => {
    thisRoom = data.room
    const message = new Message({
      user : data.userId,
      message : data.value,
      room : thisRoom,
      sender : data.sender,
      receiver : data.receiver,
      receiverName : data.receiverName,
      senderName : data.senderName
    })
    const newMessage = await message.save()
    io.to(thisRoom).emit("chat message", { data: data, id: socket.id });
  });


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      console.log(user.username + ' has left');
    }
    console.log("disconnected");
  });
});

// end socket

app.use("", authRouter)
app.use("", homeRouter)
app.use("", forgetPassword)

server.listen(port, (err) => {
  console.log('Server is up and listening on', port);
});