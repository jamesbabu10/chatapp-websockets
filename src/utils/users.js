const users = [];

//addUser,removeUser,getUser,getUserInroom

const adduser = ({ id, username, room }) => {
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username and room are required",
    };
  }

  //check for existing user
  const existinguser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existinguser) {
    return {
      error: "username is in use!",
    };
  }

  //store user
  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeuser = (id) => {
  const index = users.findIndex((user) => {
    return user.id === id;
  });
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

getuser = (id) => {
  return users.find((user) => user.id === id);
};

getusersinroom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => {
    return user.room === room;
  });
};

module.exports = {
  adduser,
  removeuser,
  getuser,
  getusersinroom,
};
