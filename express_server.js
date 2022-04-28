const express = require("express");
const app = express(); //creates interface (constructor)
const PORT = 8080; // default port 8080

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!"); //writing to client
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //writinhg JSON to client on URL path specified
});
app.get("/hello", (req, res) => { //response to send when url requested is /hello 
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});