const socket = io();

//elements
const $messageform = document.querySelector("#message-form");
const $messageforminput = $messageform.querySelector("input");
const $messageformbutton = $messageform.querySelector("button");
const $sendlocationbutton = document.querySelector("#send-location");
const $messages = document.querySelector("#messages");

//template
const messagetemplate = document.querySelector("#message-template").innerHTML;
const locationtemplate = document.querySelector(
  "#location-message-template"
).innerHTML;
const sidebartemplate = document.querySelector("#sidebar-template").innerHTML;

//Option
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoscroll = () => {
  //New message
  const $newmessage = $messages.lastElementChild;

  //Height of the new message
  const newMessageStyles = getComputedStyle($newmessage);
  const newmessagemargin = parseInt(newMessageStyles.marginBottom);
  const newmessageheight = $newmessage.offsetHeight + newmessagemargin;

  //visible height
  const visibleheight = $messages.offsetHeight;

  //Height of messages container
  const containerheight = $messages.scrollHeight;

  //how far have i scrolled
  const scrolloffset = $messages.scrollTop + visibleheight;

  if (containerheight - newmessageheight <= scrolloffset) {
    $messages.scrollTop = messages.scrollHeight;
  }
};

socket.on("message", (message) => {
  const html = Mustache.render(messagetemplate, {
    username: message.username,
    createdat: moment(message.createdat).format("h:mm a"),
    message: message.text,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("locationmessage", (message) => {
  console.log(message.url);
  const html = Mustache.render(locationtemplate, {
    username: message.username,
    createdat: moment(message.createdat).format("h:mm a"),
    url: message.url,
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoscroll();
});

socket.on("roomdata", ({ room, users }) => {
  const html = Mustache.render(sidebartemplate, {
    room,
    users,
  });
  document.querySelector("#sidebar").innerHTML = html;
});

$messageform.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageformbutton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendmessage", message, (error) => {
    $messageformbutton.removeAttribute("disabled");
    if (error) {
      return console.log(error);
    } else {
      console.log("Message Delivered!");
    }
  });
  $messageforminput.value = "";
  $messageforminput.focus();
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    $sendlocationbutton.setAttribute("disabled", "disable");
    socket.emit(
      "sendlocation",
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        console.log("Location shared");
      }
    );
    $sendlocationbutton.removeAttribute("disabled");
  });
});

socket.emit("join", { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
