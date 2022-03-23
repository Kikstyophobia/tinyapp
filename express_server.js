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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    text += possible.charAt(Math.random() * possible.length);
  }
  return text;
};

app.post("/urls", (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;
  res.redirect(`/urls/${randomString}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// app.post("/urls", (req, res) => {
//   console.log(req.body);  // Log the POST request body to the console
//   res.send(urlDatabase[req.params.shortURL]);         
// });

app.get("/urls/new", (req, res) => {
  console.log(req.body.login)
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const username = req.cookies.usernameCookie;
  const templateVars = { urls: urlDatabase, username: username };
  res.render("urls_index", templateVars);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete(urlDatabase[req.params.shortURL]);
  res.redirect("/urls");
});

//working on displaying username
app.post("/login", (req, res) => {
  let templateVars = {
    username: req.cookies.usernameCookie
  }
  res.cookie("usernameCookie", req.body.username );
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("usernameCookie");
  res.redirect('/urls');
});


// const templateVars = {
//   username: req.cookies["username"],
//   // ... any other vars
// };
// res.render("urls_index", templateVars);


// registers a handler on the root path "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

//app.get("/urls/:abc"
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

// a json response with the urlDatabase object created earlier
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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