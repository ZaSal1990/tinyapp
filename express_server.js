const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//required esp when using POST route, doing JSON parsing on form input data (body) here
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.set("view engine", "ejs"); //to enable EJS, set its as view engine

app.get("/urls", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {//**
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
  //http://localhost:8080/urls/b2xVn2

});

app.post("/urls", (req, res) => {//form brings data back to /urls
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = req.body.longURL; //with POST req, text field parameter is vaialable to req.body
  console.log(urlDatabase);
  //res.send("Ok");// Respond with 'Ok' to server
  res.redirect(`/urls/${newshortURL}`);//redirecting to route **
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {//route to delete request
  let itemToBeDeleted = req.params.shortURL;
  delete urlDatabase[itemToBeDeleted];
  console.log(urlDatabase);
  res.redirect(`/urls`);//redirecting to route **
});

app.post("/urls/:id", (req, res) => {//route to update URL
  let itemToBeUpdated = req.params.id;
  console.log(itemToBeUpdated);
  res.redirect(`/urls/${itemToBeUpdated}`);//redirecting to route **
});

app.post("/login", (req, res) => {//route to login post submission
  let username = req.body.username;
  res.cookie('username', { username : username }); //prepping/nstructing vis response server to set cookie and passed as object to be later used for session
  res.redirect(`/urls`);//redirecting to route inside ''
});

app.post("/logout", (req, res) => {//route to login post submission
  res.clearCookie('username');
  res.redirect(`/urls`);//redirecting to route inside ''
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

