const express = require("express");
const path = require("path");
const sequelize = require("./database");
const User = require("./models/User");
const UserProfile = require("./models/UserProfile");
const userRouter = require("./routes/userRouter");
const headersMiddleWare = require("./middlewares/headersMiddleWare");
const isAuthMiddleWare = require("./middlewares/isAuthMiddleWare");
const multer = require("multer");

const app = express();



app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/images/users/profile-images",
  express.static(path.join(__dirname, "images/users/profile-images"))
);

app.use(headersMiddleWare);

app.use(userRouter);

app.use((req,res,next)=>{
  return res.status(401).json({message:"notfound"})
})

User.hasOne(UserProfile, { onDelete: "CASCADE" });
UserProfile.belongsTo(User);

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
