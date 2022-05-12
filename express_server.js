const express = require("express");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

//helper functions require--------------------------------------------------------------------//

const getUserByEmail = require('./helper.js').getUserByEmail;
const generateRandomString = require('./helper.js').generateRandomString;
const ifCredentialsMatchedReturnUser = require('./helper.js').ifCredentialsMatchedReturnUser;
const returnURLSforAUser = require('./helper.js').returnURLSforAUser;

//GlobalObjects--------------------------------------------------------------------//

const urlDatabase = {};
const users = {};

//Middleware--------------------------------------------------------------------//

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ keys : ['user_id']}));
app.use(morgan('dev'));
app.set("view engine", "ejs"); //to enable EJS, set its as view engine


//GET Routes----------------------------------------------------------------------//

app.get("/", (req, res) => { //default route
  if (req.session.user_id) {
    req.session = null; //destroying session from before server was restarted
    res.redirect('/login');
  }
  res.redirect('/login'); //ensuring no access unless you're a registered user
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { //passing relevant items to urls_index ejs template
      urls : returnURLSforAUser(req.session.user_id, urlDatabase),
      user : users[req.session.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      user : users[req.session.user_id],
      urls : urlDatabase
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = {
      shortURL: req.params.shortURL,
      urls : returnURLSforAUser(req.session.user_id, urlDatabase),
      user : users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL; //extracting longURL from urlDatabase
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { //adding to user database and passing data to ejs render
    user : users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  res.render("login", templateVars);
});

//POSET Routes --------------------------------------------------------------------//

app.post("/urls", (req, res) => {//POST action: creates urlDatabase with form submission data at /urls
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  res.redirect(`/urls/${newshortURL}`); //redirects to shortURL page
});

app.post("/urls/:shortURL/delete", (req, res) => {//route to delete request
  let itemToBeDeleted = req.params.shortURL;
  delete urlDatabase[itemToBeDeleted];
  res.redirect(`/urls`);//redirecting to route 
});

app.post("/urls/:id", (req, res) => {//route to update URL
  let itemToBeUpdated = req.params.id;
  urlDatabase[itemToBeUpdated].longURL = req.body.longURL;
  res.redirect(`/urls/${itemToBeUpdated}`);
});

app.post("/register", (req, res) => {//route to login post submission for registration
  if (!req.body.email || !req.body.password) { //error handling for empty input
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    if (getUserByEmail(req.body.email, users) !== false) { //error handling for if users exists already
      res.status(400).send(`Error: ${res.statusCode} - Email exists already`);
    } else { // create/register user only if input is valid and user doesnt exisit already
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10); //storing hashed password in memory object for security
      let newId = generateRandomString(); //assign session and id
      users[newId] = {
        id : newId,
        email : req.body.email,
        password : hashedPassword
      };
      req.session.user_id = users[newId].id; //assign newly created user id to session for immediate log in
      res.redirect(`/urls`);
    }
  }
});

app.post("/login", (req, res) => {
  let newemail = req.body.email;
  let newpassword = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    console.log('from inside /login post route', users);
    let databaseSearch = ifCredentialsMatchedReturnUser(newemail, newpassword, users); //chceking is its a registered user
    if (databaseSearch.error) {
      res.status(403).send(`Error: ${res.statusCode} ${databaseSearch.error}`);
    } else if (!databaseSearch.error) {
      req.session.user_id = databaseSearch.id;
      res.redirect(`/urls`);
    }
  }
});

app.post("/logout", (req, res) => {//route to destroy session upon logout
  req.session = null;
  res.redirect(`/urls`);
});

//Port Listening----------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

