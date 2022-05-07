const express = require("express");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const morgan = require('morgan');
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const ifEmailExistsAlready = (sourceEmail, targetObject) => {
  for (let key in targetObject) {
    let item = targetObject[key];
    if (item.email === sourceEmail) {
      return true;
    }
  }
  return false;
};

const ifCredentialsMatchedReturnUser = (sourceEmail, sourcePassword, targetObject) => {
  for (let key in targetObject) {
    let user = targetObject[key];
    if (user.email === sourceEmail) {
      if (user.password === sourcePassword) {
        return user;
      } else return 'Password doesn\'t match';
    } else return 'Email doesn\'t exist';
  }
  return 'Cannot find user with these credentials';
};


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = [];

//required esp when using POST route, doing JSON parsing on form input data (body) here
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(morgan('dev'));
app.set("view engine", "ejs"); //to enable EJS, set its as view engine


//----------------------------------------------------------------------------//


app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user : req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user : req.cookies['user_id']
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user : req.cookies['user_id']
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user : req.cookies['user_id']
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.cookies['user_id'],
  };
  res.render("login", templateVars);
});


//----------------------------------------------------------------------------//



app.post("/urls", (req, res) => {//form brings data back to /urls
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = req.body.longURL; //with POST req, text field parameter is vaialable to req.body
  res.redirect(`/urls/${newshortURL}`);//redirecting to route **
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

app.post("/register", (req, res) => {//route to login post submission for registration
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    if (ifEmailExistsAlready(req.body.email, users) === true) {
      res.status(400).send(`Error: ${res.statusCode} - Email exists already`);
    } else {
      let newId = generateRandomString();
      users[newId] = {
        id : newId,
        email : req.body.email,
        password : req.body.password
      };
      console.log(users[newId]);
      res.cookie('user_id', users[newId]); //user_id should be stored
      res.redirect(`/urls`);//redirecting to route inside ''
    }
  }
});

app.post("/login", (req, res) => {//route to login post submission
  let newemail = req.body.email;
  let newpassword = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    let databaseSearch = ifCredentialsMatchedReturnUser(newemail, newpassword, users); //if user is found in DB
    if (typeof databaseSearch === "object") {
      console.log(databaseSearch);
      res.cookie('user_id', databaseSearch); //send username via cookie and establish session
      res.redirect(`/urls`);//redirecting to route inside ''
    } else res.status(403).send(`Error: ${res.statusCode} ${databaseSearch}`);
    //prepping/instructing vis response server to set cookie and passed as object to be later used for session
  }
});

app.post("/logout", (req, res) => {//route to login post submission
  res.clearCookie('user_id');
  res.redirect(`/urls`);//redirecting to route inside ''
});

//----------------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

