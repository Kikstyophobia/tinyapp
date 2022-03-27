
// takes in email and database, returns userID
const getUserByEmail = function(email, database) {
  for (let users in database) {
   if (database[users].email === email){
     return database[users].id;
   }
  }
  return false;
};

// check that current userID = stored userID, returns shortURL object list
const userIDChecker = function(userID, database) {
  let shortURL = {};

  for (let info in database) {
    if (userID === database[info].userID) {
      shortURL[info] = database[info];
    } 
  }
  return shortURL;
};

// checks if input email = stored email, returns userID or false
const userChecker = function(email, users) {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return false;
};

const getUser = function(userID, users) {
  return users[userID];
}

// generates and returns a random string for ID naming
function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.random() * possible.length);
  }
  return text;
};



module.exports = { getUserByEmail, generateRandomString, userChecker, userIDChecker, getUser };