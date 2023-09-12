const multer = require("multer");

const userProfileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "images/users/profile-images");
    },
    filename: (req, file, cb) => {
      cb(null, `${new Date().getTime()}-${file.originalname}`);
    },
  });
  
  const userProfileFileFilter = (req, file, cb) => {
    if (file.mimetype === "image/jpeg" || file.mimetype === "image/png" || file.mimetype === "image/jpg") {
      return cb(null, true);
    }
    cb(null, false);
  };


  module.exports.userProfileStorage = userProfileStorage
  module.exports.userProfileFileFilter = userProfileFileFilter