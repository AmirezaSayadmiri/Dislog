import express from "express";
import sequelize from "./database";
import multer from "multer";
import User from "./models/User";
import UserProfile from "./models/UserProfile";
import isAuthMiddleWare from "./middlewares/isAuthMiddleWare";
import headersMiddleWare from "./middlewares/headersMiddleWare";
import path from "path";
import userRoutes from "./routes/userRoutes";
import { CustomRequestHandler } from "./types/types";
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/images/users/profile-images",
  express.static(path.join(__dirname, "..", "/images/users/profile-images"))
);

app.use(headersMiddleWare);

app.use(userRoutes);

app.use((req, res, next) => {
  return res.status(401).json({ message: "notfound" });
});

UserProfile.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

sequelize
  .sync({ force: false })
  .then((result) => {
    app.listen(8000);
  })
  .catch((err) => console.log(err));
