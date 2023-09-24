import express from "express";
import sequelize from "./database";
import User from "./models/User";
import UserProfile from "./models/UserProfile";
import headersMiddleWare from "./middlewares/headersMiddleWare";
import path from "path";
import userRoutes from "./routes/userRoutes";
import questionRoutes from "./routes/questionRoutes";
import answerRoutes from "./routes/answerRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import tagRoutes from "./routes/tagRoutes";
import Question from "./models/Question";
import Category from "./models/Category";
import Answer from "./models/Answer";
import Tag from "./models/Tag";
import Ticket from "./models/Ticket";
import ticketRoutes from "./routes/ticketRoutes";
import errorHandler from "./controllers/errorControllers";
import AppError from "./AppError";

process.on("uncaughtException", (err) => {
    console.log(err);
    process.exit(1);
});

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/images/users/profile-images", express.static(path.join(__dirname, "..", "/images/users/profile-images")));
app.use("/images/questions", express.static(path.join(__dirname, "..", "/images/questions")));
app.use("/images/answers", express.static(path.join(__dirname, "..", "/images/answers")));

// middlewares
app.use(headersMiddleWare);

// routes
app.use(userRoutes);
app.use(questionRoutes);
app.use(answerRoutes);
app.use(categoryRoutes);
app.use(tagRoutes);
app.use(ticketRoutes);

app.use((req, res, next) => {
    next(new AppError("notfound",404))
});

app.use(errorHandler);

// relations
UserProfile.belongsTo(User, { onDelete: "CASCADE", foreignKey: { allowNull: false } });
User.hasOne(UserProfile);

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

User.hasMany(Question, { foreignKey: { allowNull: false } });
Question.belongsTo(User);

Category.hasMany(Question, { onDelete: "CASCADE", foreignKey: { allowNull: false } });
Question.belongsTo(Category);

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

Question.hasMany(Answer, { foreignKey: { allowNull: false } });
Answer.belongsTo(Question);

User.hasMany(Answer, { foreignKey: { allowNull: false } });
Answer.belongsTo(User);

Answer.belongsToMany(User, {
    as: "Ulike",
    through: "UserAnswerLike",
    foreignKey: "answerId",
});
User.belongsToMany(Answer, {
    as: "Alike",
    through: "UserAnswerLike",
    foreignKey: "userId",
});

Answer.belongsToMany(User, {
    as: "UDlike",
    through: "UserAnswerDisLike",
    foreignKey: "answerId",
});
User.belongsToMany(Answer, {
    as: "ADlike",
    through: "UserAnswerDisLike",
    foreignKey: "userId",
});

Tag.belongsToMany(Question, { through: "QuestionTag", as: "Question", foreignKey: "tagId" });
Question.belongsToMany(Tag, { through: "QuestionTag", as: "Tag", foreignKey: "questionId" });

User.hasMany(Ticket, { foreignKey: { allowNull: false }, onDelete: "CASCADE" });
Ticket.belongsTo(User);

sequelize
    .sync({ force: false })
    .then((result) => {
        const server = app.listen(8000);

        process.on("unhandledRejection", (err) => {
            console.log(err);
            server.close(() => {
                process.exit(1);
            });
        });
    })
    .catch((err) => console.log(err));
