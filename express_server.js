const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const app = express(); //creates interface (constructor)
const PORT = process.env.PORT || 8080;

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
app.set("view engine", "ejs"); //to enable EJS, set its as view engine


//GET Routes----------------------------------------------------------------------//

app.get("/", (req, res) => { //default route
  if (req.session.user_id) {
    res.redirect('/urls');
  }
  res.redirect('/login'); //ensuring no access unless you're a registered user
});

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    const templateVars = { //passing relevant items to urls_index ejs template
      urls : returnURLSforAUser(req.session.user_id, urlDatabase), //to display URL list for the user
      user : users[req.session.user_id],
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => { //landing page for when user wants to create new user
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

app.get("/urls/:shortURL", (req, res) => {//landing page when shortURL is accessed
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send(`Error: User not authorized`);
  } else {
    if (req.params.shortURL in urlDatabase && urlDatabase[req.params.shortURL].longURL) { //if $this short URL is present in url database against $this userID for any long URL
      const templateVars = {
        shortURL: req.params.shortURL,
        urls : returnURLSforAUser(req.session.user_id, urlDatabase),
        user : users[req.session.user_id],
      };
      res.render("urls_show", templateVars);
    }
  }
});

app.get("/u/:shortURL", (req, res) => {//reditrection from short to long URL
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (req.session.user_id === urlDatabase[req.params.shortURL].userID && urlDatabase[req.params.shortURL].longURL) {//if Long URL exists for $this short URL for $this particular user ID
    const longURL = urlDatabase[req.params.shortURL].longURL; //extracting longURL from urlDatabase
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  if (users[req.session.user_id]) { //user exists already in users databse
    res.redirect('/urls');
  } else {
    const templateVars = { //adding to user database and passing data to ejs render
      user : users[req.session.user_id],
    };
    res.render("register", templateVars);
  }
});

app.get("/login", (req, res) => {
  if (users[req.session.user_id]) { //user exists already in users databse
    res.redirect('/urls');
  } else {
    const templateVars = {
      user: req.session.user_id,
    };
    res.render("login", templateVars);
  }
});

//POST Routes --------------------------------------------------------------------//

app.post("/urls", (req, res) => {//POST action: creates urlDatabase with form submission data at /urls
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let newshortURL = generateRandomString();
    urlDatabase[newshortURL] = {
      longURL : req.body.longURL,
      userID : req.session.user_id
    };
    res.redirect(`/urls/${newshortURL}`); //redirects to shortURL page
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {//route to delete request
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (req.session.user_id !== urlDatabase[req.params.shortURL].userID) {
    res.status(403).send(`Error: User not authorized`);
  } else {
    let itemToBeDeleted = req.params.shortURL;
    delete urlDatabase[itemToBeDeleted];
    res.redirect(`/urls`);//redirecting to route
  }
});

app.post("/urls/:id", (req, res) => {//route to update URL
  if (!req.session.user_id) {
    res.redirect('/login');
  } else if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    res.status(403).send(`Error: User not authorized`);
  } else {
    let itemToBeUpdated = req.params.id;
    if (req.body.longURL) {
      urlDatabase[itemToBeUpdated].longURL = req.body.longURL;
    } res.redirect(`/urls/${itemToBeUpdated}`);
  }
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
