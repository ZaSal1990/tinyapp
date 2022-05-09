const express = require("express");
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');

const bodyParser = require("body-parser");
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
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

const retrunURLSForTheUser = (userCookie, targetObject) => {
  let result = [];
  console.log(userCookie);
  for (let key in targetObject) {
    if (targetObject[key].userID === userCookie) {
      result.push(targetObject[key].longURL);
    }
  }
  return result;
};


const ifCredentialsMatchedReturnUser = (sourceEmail, sourcePassword, targetObject) => {
  console.log('from inside fns body',users);
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
  console.log('user cookie check',userCookie);
  for (let key in targetObject) {
    let user = targetObject[key];
    console.log('target objcet', targetObject, 'user cookie', userCookie);
    if (user.userID === userCookie) {
      newDatabase[key] = user.longURL;
    }
  }
  return newDatabase;
};

const urlDatabase = {
  // "b2xVn2": {
  //   longURL : "http://www.lighthouselabs.ca",
  //   userID: "cz1dxi"
  // },
  // "9sm5xK": {
  //   longURL : "http://www.google.com",
  //   userID : "9sm5xK"
  // }
};


const users = {};

//required esp when using POST route, doing JSON parsing on form input data (body) here
app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({ keys : ['user_id']}));
app.use(morgan('dev'));
app.set("view engine", "ejs"); //to enable EJS, set its as view engine


//----------------------------------------------------------------------------//


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
    //console.log(req.cookies['user_id'].id); //dead code
    //console.log(urlDatabase);//dead code
    //console.log(retrunURLSForTheUser(req.cookies['user_id'].id, urlDatabase));
    res.render("urls_index", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    console.log(req.session.user_id); //dead code
    console.log(urlDatabase);//dead code
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
    //console.log(req.cookies['user_id'].id); //dead code
    //console.log(urlDatabase);//dead code
    //let URL = retrunURLSForTheUser(req.cookies['user_id'].id, urlDatabase);
    //console.log(URL);
    const templateVars = {
      shortURL: req.params.shortURL,
      urls : retrunURLSForTheUser(req.session.user_id, urlDatabase),
      user : users[req.session.user_id],
    };
    console.log(templateVars.urls);
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


//----------------------------------------------------------------------------//


app.post("/urls", (req, res) => {//form brings data back to /urls
  let newshortURL = generateRandomString();
  urlDatabase[newshortURL] = {
    longURL : req.body.longURL,
    userID : req.session.user_id
  };
  //with POST req, text field parameter is vaialable to req.body
  res.redirect(`/urls/${newshortURL}`);//redirecting to route **
});

app.post("/urls/:shortURL/delete", (req, res) => {//route to delete request
  let itemToBeDeleted = req.params.shortURL;
  delete urlDatabase[itemToBeDeleted];
  //console.log(urlDatabase);
  res.redirect(`/urls`);//redirecting to route **
});

app.post("/urls/:id", (req, res) => {//route to update URL
  let itemToBeUpdated = req.params.id;
  urlDatabase[itemToBeUpdated].longURL = req.body.longURL;
  res.redirect(`/urls/${itemToBeUpdated}`);//redirecting to route **
});

app.post("/register", (req, res) => {//route to login post submission for registration
  if (!req.body.email || !req.body.password) {
    res.status(400).send(`Error: ${res.statusCode} - Invalid data input`);
  } else {
    if (ifEmailExistsAlready(req.body.email, users) === true) {
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
      console.log('from inside /register post route', users);
      //console.log(users[newId]);
      //res.cookie('user_id', users[newId]); //user_id should be stored
      req.session.user_id = users[newId].id;
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
    console.log('from inside /login post route', users);
    let databaseSearch = ifCredentialsMatchedReturnUser(newemail, newpassword, users); //if user is found in DB
    //console.log(typeof databaseSearch); //unable to find user when login with second registrant
    if (/*typeof*/ databaseSearch.error /*=== 'string'*/) {
      //console.log(databaseSearch);
      res.status(403).send(`Error: ${res.statusCode} ${databaseSearch.error}`);
    } else if (!databaseSearch.error) {
      //console.log(databaseSearch);
      req.session.user_id = databaseSearch.id;
      //res.cookie('user_id', databaseSearch); //send username via cookie and establish session
      res.redirect(`/urls`);//redirecting to route inside ''
    }
  }
  //prepping/instructing vis response server to set cookie and passed as object to be later used for session
});

app.post("/logout", (req, res) => {//route to login post submission
  //res.clearCookie('user_id');
  req.session = null;
  res.redirect(`/urls`);//redirecting to route inside ''
});

//----------------------------------------------------------------------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

