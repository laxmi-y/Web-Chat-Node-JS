var app = require("express")();
var http = require("http").createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
const { joinUser, removeUser, findUser } = require('./users');

app.get("/", function (req, res) {
  res.send("Server is running");
});

const dbConnect = require("./db")
const Message = require("./models/Message")
dbConnect() 


let thisRoom = "";
io.on("connection", function (socket) {
  console.log("connected");
  socket.on("join room", (data) => {
    let Newuser = joinUser(socket.id, data.username, data.roomName)
    socket.emit('send data', { id: socket.id, username: Newuser.username, roomname: Newuser.roomname });
    thisRoom = Newuser.roomname;
    console.log(Newuser);
    socket.join(Newuser.roomname);
  });

  socket.on("chat message", async(data) => {
    thisRoom = data.room
    const message = new Message({
      user : data.user,
      message : data.value,
      room : thisRoom,
    })
    const newMessage = await message.save()
    io.to(thisRoom).emit("chat message", { data: data, id: socket.id });
  });


  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    console.log(user);
    if (user) {
      console.log(user.username + ' has left');
    }
    console.log("disconnected");
  });
});

//get all messages
app.get("/api/messages", (req,res)=>{
  Message.find().then(function(messages){
      res.send(messages)
  })
})

http.listen(3000, function () { 
  console.log(`listen on ${3000} port`)
});
