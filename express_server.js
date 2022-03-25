const express = require('express');
const app = express();
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const PORT = 8080; 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");
app.use(morgan('dev'))
app.use(cookieParser());

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "1234"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
    b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "aJ48lW"
    }
};

//// FUNCTIONS

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.random() * possible.length);
  }
  return text;
};

const userChecker = function(email) {
  for (let id in users) {
    if (email === users[id].email) {
      return users[id];
    }
  }
  return false;
};

const passwordChecker = function(password) {
  for (let id in users) {
    if (password === users[id].password) {
      return true;
    }
  }
  return false;
};

const userIDChecker = function(userID) {
  let shortURL = {};

  for (let info in urlDatabase) {
    if (userID === urlDatabase[info].userID) {
      shortURL[info] = urlDatabase[info];
    } 
  }
  return shortURL;
};



//// LOGIN / LOGOUT USERS
app.get("/login", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("login", templateVars);
});

//
app.post("/login", (req, res) => {
  if (userChecker(req.body.email) && passwordChecker(req.body.password)) {
    res.cookie("userID", userChecker(req.body.email).id);
    res.redirect("/urls");

  } else {
    res.send("<html><body><b>403</b> Forbidden request!</body></html>\n");
  }
});

//
app.post("/login", (req, res) => {
  let templateVars = {
    username: req.cookies.userID
  }
  res.cookie("userID", req.body.username );
  res.redirect('/urls');
});

//
app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect('/urls');
});




//// REGISTER USERS
// not required to change urlDatabase
app.get("/register", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("register", templateVars);
});


app.post("/register", (req, res) => {
  let user = userChecker(req.body.email);
  if (!req.body.email || !req.body.password) {
    res.send("<html><body><b>400</b> Must enter email or password!</body></html>\n");
  } else if (user.email === req.body.email) {
    res.send("<html><body><b>400</b> User already exists!</body></html>\n");
  } else {

  const userID = generateRandomString();
  users[userID] = {id: userID, mail: req.body.email, password: req.body.password};

  res.cookie("userID", userID);
  res.redirect("/urls");
  console.log("users print", users)
  }
});




// URLs
app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  let username = req.cookies.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to access this page.</body></html>\n");
  }

  urlDatabase[randomString] = {
    longURL: req.body.longURL,
    userID: username
  }

  res.redirect(`/urls`);
});

app.get("/urls", (req, res) => {
  const username = req.cookies.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to access this page.</body></html>\n");
  }
  let usersShortURLs = userIDChecker(username);
  const templateVars = { urls: usersShortURLs, username: username };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const username = req.cookies.userID;
 
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to edit links.</body></html>\n");
  } else {
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_new", templateVars);
  }
});


// ANYONE CAN VISIT SHORT URLs
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const username = req.cookies.userID;
  console.log("req.params",req.params)
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, username };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/update", (req,res) => {
  const username = req.cookies.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to update links.</body></html>\n");
  } 

  let shortURL = req.params.id;

  if (username === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  let username = req.cookies.userID;
  if (!username) {
    return res.send("<html><body><b>Error!</b> Must be logged in to delete links.</body></html>\n");
  }

  let shortURL = req.params.shortURL;
  console.log("urlDatabase[shortURL].userID", urlDatabase[shortURL].userID)
  console.log("username", username)
  
  if (username === urlDatabase[shortURL].userID) {
    
    delete(urlDatabase[req.params.shortURL]);
    res.redirect("/urls");
  }
});


// a json response with the urlDatabase object created earlier
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("*", (req, res) => {
  res.send("<html><body><b>Error!</b> Page not found.</body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});