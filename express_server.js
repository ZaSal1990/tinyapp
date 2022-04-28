const express = require("express");
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.set("view engine", "ejs"); //to enable EJS, set its as view engine

app.get("/", (req, res) => {
  res.send("Hello!"); //writing to client
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //writinhg JSON to client on URL path specified
});
app.get("/hello", (req, res) => { //response to send when url requested is /hello
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
  //http://localhost:8080/urls/b2xVn2
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

