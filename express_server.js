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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

//// LOGIN / LOGOUT USERS
app.get("/login", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("login", templateVars);
});


app.post("/login", (req, res) => {
  if (userChecker(req.body.email) && passwordChecker(req.body.password)) {
    res.cookie("userID", userChecker(req.body.email).id);
    res.redirect("/urls");
  } else {
    res.send("<html><body><b>403</b> Forbidden request!</body></html>\n");
  }
});


app.post("/login", (req, res) => {
  let templateVars = {
    username: req.cookies.userID
  }
  res.cookie("userID", req.body.username );
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect('/urls');
});




//// REGISTER USERS
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
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});


app.post("/urls", (req, res) => {
  res.send(urlDatabase[req.params.shortURL]);         
});


app.get("/urls", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});


app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


app.post("/urls/:id/update", (req,res) => {
  let shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});


app.get("/urls/new", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { urls: urlDatabase, username: username };
  console.log(req.body.login)
  res.render("urls_new", templateVars);
});


app.post("/urls/:shortURL/delete", (req, res) => {
  delete(urlDatabase[req.params.shortURL]);
  res.redirect("/urls");
});





app.get("/urls/:shortURL", (req, res) => {
  const username = req.cookies.userID;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username };
  res.render("urls_show", templateVars);
});

app.get("*", (req, res) => {
  res.send("<html><body><b>Error!</b> Page not found.</body></html>\n");
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});