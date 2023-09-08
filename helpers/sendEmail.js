const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "asanime84@gmail.com",
    pass: "xeereclljyceraop",
  },

});

const sendEmail = async (to, subject, text, html) => {
  const mailData = {
    from: "asanime84@gmail.com",
    to,
    subject,
    text,
    html,
  };
   transporter.sendMail(mailData, (err, info) => {
    if (err) {
      throw Error(err)
    }
  });
};

module.exports = sendEmail;
