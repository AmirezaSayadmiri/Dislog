const express = require("express");
const path = require("path");
const sequelize = require("./database");
const User = require("./models/User");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

sequelize
  .sync({ force: true })
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
