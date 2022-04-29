const express = require("express");
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

const generateRandomString = () => {
  return Math.random().toString(36).slice(2, 8);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const bodyParser = require("body-parser"); //required esp when using POST route, doing JSON parsing on form inout data here
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs"); //to enable EJS, set its as view engine

// app.get("/", (req, res) => {
//   res.send("Hello!"); //writing to client
// });
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase); //writinhg JSON to client on URL path specified
// });
// app.get("/hello", (req, res) => { //response to send when url requested is /hello
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});
app.get("/urls/:shortURL", (req, res) => {//**
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

