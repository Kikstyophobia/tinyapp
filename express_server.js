const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const PORT = 8080; 
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const { 
  getUserByEmail, 
  generateRandomString, 
  userChecker,
  getUser, 
  userIDChecker 
} = require("./helper/helpers");


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(morgan('dev'))
app.use(cookieSession({
  name: 'session',
  keys: ['encrypt', 'password', '1234' ],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "$2a$10$hDZb1AUszZqkV9LrGB.MvuoWIE/wDYRot5TEJJYmBYuh7gVnZGzN6"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "$2a$10$hDZb1AUszZqkV9LrGB.MvuoWIE/wDYRot5TEJJYmBYuh7gVnZGzN6"
  },
  p6ZDxj: {
    id: 'p6ZDxj',
    email: 'testUser',
    password: '$2a$10$hDZb1AUszZqkV9LrGB.MvuoWIE/wDYRot5TEJJYmBYuh7gVnZGzN6'
  } // password is 'test'
};


const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "p6ZDxj"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "p6ZDxj"
    }
};


//// LOGIN / LOGOUT USERS
app.get("/login", (req, res) => {
  const username = req.session.userID;
  const templateVars = { urls: urlDatabase, user: null };
  res.render("login", templateVars);
});

// Checks login credentials, else, redirect 403
app.post("/login", (req, res) => {
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let email = req.body.email;
  let user = userChecker(email , users);

  if (user.email === email) {
    if (bcrypt.compareSync(password, hashedPassword)) {
      req.session.userID = user.id;
      res.redirect("/urls");
    }
  } 
  else {
    res.send("<html><body><b>403</b> Forbidden request!</body></html>\n");
  }
});


// creates cookie after login, redirects to /urls
app.post("/login", (req, res) => {
  // let templateVars = {
  //   username: req.session.userID
  // }
  req.session.userID = req.body.username;
  res.redirect('/urls');
});

// logout clears cookies and redirects to login page
app.post("/logout", (req, res) => {
  res.clearCookie("session");
  res.redirect('/login');
});


//// REGISTER USERS
app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, user: null };
  res.render("register", templateVars);
});

// checks if user is already registered
app.post("/register", (req, res) => {
  let user = userChecker(req.body.email, users);
  if (!req.body.email || !req.body.password) {
    res.send("<html><body><b>400</b> Must enter email or password!</body></html>\n");
  } else if (user.email === req.body.email) {
    res.send("<html><body><b>400</b> User already exists!</body></html>\n");
  } else {

  const userID = generateRandomString();
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  users[userID] = {id: userID, email: req.body.email, password: hashedPassword};

  //res.cookie("userID", userID);
  req.session.userID = userID;
  res.redirect("/urls");
  console.log("users print", users[userID]); // prints new user details
  }
});




// URLs
// creates a new short URL and adds to urlDatabase
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  let username = req.session.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to access this page.</body></html>\n");
  }

  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: username
  }
  console.log(randomString ,urlDatabase[randomString]); // prints out new link and associated information in console
  res.redirect(`/urls`);
});

// list of urls access to logged in users only
app.get("/urls", (req, res) => {
  const username = req.session.userID;
  const userObj = getUser(username, users);
  let usersShortURLs = userIDChecker(username, urlDatabase);
  
  const templateVars = { urls: usersShortURLs, user: userObj };
  if (!username) {
    res.render("urls-login-error", templateVars);
  }
  res.render("urls_index", templateVars);
});

// edit links page, can only be accessed by logged in users
app.get("/urls/new", (req, res) => {
  const username = req.session.userID;
  const userObj = getUser(username, users);
  const templateVars = { urls: urlDatabase, user: userObj };
  if (!username) {
  res.render("urls-login-error", templateVars);
  } 

  res.render("urls_new", templateVars);

});


// Anyone can visit short URLs, invalid links return error
app.get("/u/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;

  for (let shortURLs in urlDatabase) {
    if (shortURL === shortURLs) {
      const longURL = urlDatabase[shortURLs].longURL;
      res.redirect(longURL);
    } 
  }
  return res.send("<html><body><b>Error!</b> Invalid link.</body></html>\n");
});


app.get("/urls/:shortURL", (req, res) => {
  const username = req.session.userID;
  const shortURL = req.params.shortURL;
  const longURL = "";
  let templateVars = { shortURL, longURL, user: username};
  const userObj = getUser(username, users);

  if (!username) {
    return res.render("urls-login-error", templateVars);
  } 
  templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: userObj };
  res.render("urls_show", templateVars);
});

// update links for logged in users only
app.post("/urls/:id/update", (req,res) => {
  const username = req.session.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to update links.</body></html>\n");
  } 

  let shortURL = req.params.id;

  if (username === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});

// delete URLs and their associated urlDatabase object
app.post("/urls/:shortURL/delete", (req, res) => {
  let username = req.session.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to delete links.</body></html>\n");
  }

  let shortURL = req.params.shortURL;
  if (username === urlDatabase[shortURL].userID) {
    
    delete(urlDatabase[req.params.shortURL]);
    res.redirect("/urls");
  }
});

// home page is login page
app.get("/", (req, res) => {
  res.redirect("/login");
});

// For all other unexpected errors
app.get("*", (req, res) => {
  res.send("<html><body><b>Error!</b> Page not found.</body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});