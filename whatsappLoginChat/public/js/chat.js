var socket = io("http://localhost:3000/");
let textarea = document.querySelector("#textarea")
let messageArea = document.querySelector(".message_area")
let userName = $("#loginUser").text()
let room = "";
let userId = $("#currentUser").text()
let ID = "";
socket.emit("join room", {username : userName, roomName : userId});
let receiverName


$(".login-user-profile").click(function(e){
    $('.main').hide()
    $(".chat-area").hide()
    $(".profile-section").show()

})
$(".leaderboard__profile").click(function(e){
    $('.main').hide()
    $('.profile-section').hide()
    $(".chat-area").show()
    room = $(this).attr("data-userid")
    chatUser = $(this).attr("data-name")
    $(".user_name").text(chatUser)
    $(".user_id").text(room)
    $("#messages").empty()
    receiverName = $(this).text().trim()

    fetch("/messages")
    .then(res => res.json())
    .then(result =>{
        result.forEach(data => {
            if((data.receiver == room && data.sender == userId) || (data.receiver == userId && data.sender == room)){
                savedMessage(data)
            }
        });
    })

    socket.emit("join room", {username : userName, roomName : room});

});

//send event that user has joined room

//receive data from server.
socket.on('send data',(data)=>{
    ID = data.id; //ID will be used later
})

textarea.addEventListener('keyup', (e)=>{
    if(e.key === 'Enter')
    {
        e.preventDefault();
        socket.emit("chat message", {
          value: e.target.value,
          user: userName,
          userId: userId,
          room : room,
          sender : userId,
          receiver : room,
          receiverName : receiverName,
          senderName : userName
        });
    }
})


socket.on("chat message", (data) => {
        var userid = $('.user_id').text()
        if(data.data.sender == userid || data.data.receiver == userid){
            displayMessage(data);
            textarea.value = " "
        }
});

function displayMessage(data) {
    let authorClass = "";
  let divClass = ""
  //verify that the user ID and the message sent ID is similar 
  if (data.id === ID) {
    authorClass = "me";
    divClass = "myDiv";
  } else {
    authorClass = "you";
    divClass = "yourDiv";
  }
  const div = document.createElement("div");
  div.className = divClass;
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.className = "time";
  p.innerText = moment().format("hh:mm");
  div.innerHTML =
    '<p class="' +
    authorClass +
    '">' +
    data.data.user +
    "</p>" +
    '<p class="message"> ' +
    data.data.value +
    "</p>";
  div.appendChild(p);
  li.appendChild(div);

  document.getElementById("messages").appendChild(li);
  //scroll to the bottom
  scrollToBottom()
}


function savedMessage(data) {
    let user
    let authorClass = "";
  let divClass = ""
  //verify that the user ID and the message sent ID is similar 

  if (data.sender === userId) {
    user = userName
    authorClass = "me";
    divClass = "myDiv";
  } else {
    user = data.senderName
    authorClass = "you";
    divClass = "yourDiv";
  }
  const div = document.createElement("div");
  div.className = divClass;
  const li = document.createElement("li");
  const p = document.createElement("p");
  p.className = "time";
  p.innerText = moment(data.createdAt).format('hh:mm')
  div.innerHTML =
    '<p class="' +
    authorClass +
    '">' +
    user +
    "</p>" +
    '<p class="message"> ' +
    data.message +
    "</p>";
  div.appendChild(p);
  li.appendChild(div);

  document.getElementById("messages").appendChild(li);
  //scroll to the bottom
  scrollToBottom()
}

function scrollToBottom(){
    messageArea.scrollTop = messageArea.scrollHeight
}
