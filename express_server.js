const express = require("express");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const bodyParser = require("body-parser");
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080
const getUserByEmail = require('./helper.js');

//Functions--------------------------------------------------------------------//

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

// const ifEmailExistsAlready = (sourceEmail, targetObject) => {
//   for (let key in targetObject) {
//     let item = targetObject[key];
//     if (item.email === sourceEmail) {
//       return true;
//     }
//   }
//   return false;
// };

const retrunURLSForTheUser = (userCookie, targetObject) => {
  let result = [];
  for (let key in targetObject) {
    if (targetObject[key].userID === userCookie) {
      result.push(targetObject[key].longURL);
    }
  }
  return result;
};

const ifCredentialsMatchedReturnUser = (sourceEmail, sourcePassword, targetObject) => {
  for (let key in targetObject) {
    let user = targetObject[key];
    if (user.email === sourceEmail) {
      let hashedPassword = user.password;
      if (bcrypt.compareSync(sourcePassword, hashedPassword)) {
        return user;
      }
    }
  }
  return { error : 'email/password doesn\'t match'}; //'Cannot find user with these credentials';
};

const returnURLSforAUser = (userCookie, targetObject) => {
  let newDatabase = {};
  for (let key in targetObject) {
    let user = targetObject[key];

    if (user.userID === userCookie) {
      newDatabase[key] = user.longURL;
    }
  }
  return newDatabase;
};


//GlobalObjects--------------------------------------------------------------------//
const urlDatabase = {};
const users = {};


//Middleware--------------------------------------------------------------------//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ keys : ['user_id']}));
app.use(morgan('dev'));
app.set("view engine", "ejs"); //to enable EJS, set its as view engine


//GET Routes----------------------------------------------------------------------//

app.get("/urls", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    console.log('url database', urlDatabase);
    const templateVars = {
      urls : returnURLSforAUser(req.session.user_id, urlDatabase),
      user : users[req.session.user_id],
    };
    console.log('temolateVars' ,templateVars.urls);
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
      urls : retrunURLSForTheUser(req.session.user_id, urlDatabase),
      user : users[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user : users[req.session.user_id],
  };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: req.session.user_id,
  };
  console.log('from inside /login GET route', users)
  res.render("login", templateVars);
});

//POSET Routes --------------------------------------------------------------------//

app.post("/urls", (req, res) => {//form brings data back to /urls
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  res.redirect(`/urls/${newshortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {//route to delete request
  let itemToBeDeleted = req.params.shortURL;
  delete urlDatabase[itemToBeDeleted];
  res.redirect(`/urls`);//redirecting to route **
});

app.post("/urls/:id", (req, res) => {//route to update URL
  let itemToBeUpdated = req.params.id;
  urlDatabase[itemToBeUpdated].longURL = req.body.longURL;
  res.redirect(`/urls/${itemToBeUpdated}`);
});

app.post("/register", (req, res) => {//route to login post submission for registration
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    if (getUserByEmail(req.body.email, users) !== false) {
      res.status(400).send(`Error: ${res.statusCode} - Email exists already`);
    } else {
      const password = req.body.password;
      const hashedPassword = bcrypt.hashSync(password, 10);
      let newId = generateRandomString();
      users[newId] = {
        id : newId,
        email : req.body.email,
        password : hashedPassword
      };
      req.session.user_id = users[newId].id;
      res.redirect(`/urls`);
    }
  }
});

app.post("/login", (req, res) => {//route to login post submission
  let newemail = req.body.email;
  let newpassword = req.body.password;
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    console.log('from inside /login post route', users);
    let databaseSearch = ifCredentialsMatchedReturnUser(newemail, newpassword, users);
    if (databaseSearch.error) {
      res.status(403).send(`Error: ${res.statusCode} ${databaseSearch.error}`);
    } else if (!databaseSearch.error) {
      req.session.user_id = databaseSearch.id;
      res.redirect(`/urls`);
    }
  }
});

app.post("/logout", (req, res) => {//route to login post submission
  req.session = null;
  res.redirect(`/urls`);
});

//Port Listening----------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

