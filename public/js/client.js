//required for front end communication between client and server
const socket = io();

const inboxPeople = document.querySelector(".inbox__people");
const inputField = document.querySelector(".message_form__input");
const messageForm = document.querySelector(".message_form");
const messageBox = document.querySelector(".messages__history");

let userName = "";
let id;

const newUserConnected = function () {
  id = Math.floor(Math.random() * 1000000);
  userName = 'user-' + id;
  socket.emit("new user", userName);
};

const addToUsersBox = function (userName) {
  if (!document.querySelector(`.${userName}-userlist`)) {
    const userBox = `
      <div class="chat_id ${userName}-userlist">
        <h5>${userName}</h5>
      </div>
    `;
    inboxPeople.innerHTML += userBox;
  }
};

socket.on("new user", function (data) {
  data.forEach(function (user) {
    addToUsersBox(user);
  });
});

socket.on("user joined", function(data){
  addToUsersBox(data);
  const joinedMessage = `
  <br>
    <div class="message receiver joined">
      <div class="message__content">${data} has joined</div>
    </div>
  </br>
  `;
  messageBox.innerHTML += joinedMessage;
  messageBox.scrollTop = messageBox.scrollHeight;
});

socket.on("user disconnected", function (userName) {
  document.querySelector(`.${userName}-userlist`).remove();
  const disconnectedMessage = `
  <br>
    <div class="message receiver left">
      <div class="message__content">${userName} has left</div>
    </div>
    <div></div>
  </br>
  `;
  messageBox.innerHTML += disconnectedMessage;
  messageBox.scrollTop = messageBox.scrollHeight;
});

const addNewMessage = ({ user, message }) => {
 const time = new Date();
  const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

  const messageHTML = `
  <br>
    <div class="message ${user === userName ? 'sender' : 'receiver'}">
      <div class="message__content">${message}</div>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </br>
  `;

  messageBox.innerHTML += messageHTML;
  messageBox.scrollTop = messageBox.scrollHeight;
};

messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!inputField.value) {
    return;
  }

  if (inputField.value.match(/<[^>]+>/g)){
    alert("Can't send html");
    return;
  }

  socket.emit("chat message", {
    message: inputField.value,
    nick: userName,
  });

  inputField.value = "";
});

socket.on("chat message", function (data) {
  addNewMessage({ user: data.nick, message: data.message });
});

// Call newUserConnected to initialize the user when the page loads
newUserConnected();

inputField.addEventListener("keypress", () => {
  socket.emit("typing", {nick: userName, typing: true})
});
inputField.addEventListener("blur", () => {
  socket.emit("typing", {nick: userName, typing: false})
});
socket.on("typing status", function(data){
  var user = document.querySelector(`.${data.nick}-userlist`);
  if (data.typing){
    user.innerHTML = `<h5>${data.nick} is typing</h5>`;
  } else{
    user.innerHTML= `<h5>${data.nick}</h5>`;
  }
});

