const express = require("express");
const path = require("path");
const sequelize = require("./database");
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const userRouter = require("./routes/userRouter");
const headersMiddleWare = require("./middlewares/headersMiddleWare");
const isAuthMiddleWare = require("./middlewares/isAuthMiddleWare");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.use(headersMiddleWare);
// app.use(isAuthMiddleWare);

app.use(userRouter);

User.hasOne(UserProfile, { onDelete: "CASCADE" });
UserProfile.belongsTo(User);

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
