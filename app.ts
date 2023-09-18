import express from "express";
import sequelize from "./database";
import multer from "multer";
import User from "./models/User";
import UserProfile from "./models/UserProfile";
import isAuthMiddleWare from "./middlewares/isAuthMiddleWare";
import headersMiddleWare from "./middlewares/headersMiddleWare";
import path from "path";
import userRoutes from "./routes/userRoutes";
import questionRoutes from "./routes/questionRoutes";
import answerRoutes from "./routes/answerRoutes";
import { CustomRequestHandler } from "./types/types";
import Question from "./models/Question";
import Category from "./models/Category";
import Answer from "./models/Answer";

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images/users/profile-images", express.static(path.join(__dirname, "..", "/images/users/profile-images")));
app.use("/images/questions", express.static(path.join(__dirname, "..", "/images/questions")));

// middlewares
app.use(headersMiddleWare);

// routes
app.use(userRoutes);
app.use(questionRoutes);
app.use(answerRoutes)

app.use((req, res, next) => {
    return res.status(404).json({ message: "notfound" });
});

// relations
UserProfile.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
UserProfile.belongsToMany(UserProfile, {
    as: "Following",
    through: "UserProfileUserProfile",
    foreignKey: "userId",
});
UserProfile.belongsToMany(UserProfile, {
    as: "Follower",
    through: "UserProfileUserProfile",
    foreignKey: "followingUserId",
});
User.hasMany(Question);
Question.belongsTo(User);
Category.hasMany(Question, { foreignKey: "categoryId", onDelete: "CASCADE" });
Question.belongsToMany(User, {
    as: "Ulike",
    through: "UserQuestionLike",
    foreignKey: "questionId",
});
User.belongsToMany(Question, {
    as: "Qlike",
    through: "UserQuestionLike",
    foreignKey: "userId",
});

User.belongsToMany(Question, {
    as: "QDlike",
    through: "UserQuestionDisLike",
    foreignKey: "userId",
});
Question.belongsToMany(User, {
    as: "UDlike",
    through: "UserQuestionDisLike",
    foreignKey: "questionId",
});

Question.belongsToMany(User, {
    as: "Uview",
    through: "UserQuestionView",
    foreignKey: "questionId",
});
User.belongsToMany(Question, {
    as: "Qview",
    through: "UserQuestionView",
    foreignKey: "userId",
});

Question.hasMany(Answer)
Answer.belongsTo(Question)
User.hasMany(Answer)
Answer.belongsTo(User)

Answer.belongsToMany(User, {
    as: "Ulike",
    through: "UserAnswerLike",
    foreignKey: "answerId",
});
User.belongsToMany(Question, {
    as: "Alike",
    through: "UserAnswerLike",
    foreignKey: "userId",
});

Answer.belongsToMany(User, {
    as: "UDlike",
    through: "UserAnswerDisLike",
    foreignKey: "answerId",
});
User.belongsToMany(Question, {
    as: "ADlike",
    through: "UserAnswerDisLike",
    foreignKey: "userId",
});


sequelize
    .sync({ force: false })
    .then((result) => {
        app.listen(8000);
    })
    .catch((err) => console.log(err));
