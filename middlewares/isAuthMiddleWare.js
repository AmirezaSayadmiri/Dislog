const jwt = require("jsonwebtoken");

const isAuthMiddleWare = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (token) {
    try {
      const decodedToken = jwt.verify(token, "supersupersecretkey");
      if (decodedToken) {
        req.userId = decodedToken.userId;
        return next();
      }
      return res.status(401).json({ message: "unauthorizated" });
    } catch (err) {
      return res
        .status(401)
        .json({ message: "unauthorizated" });
    }
  }
  res.status(401).json({ message: "unauthorizated" });
};

module.exports = isAuthMiddleWare;
