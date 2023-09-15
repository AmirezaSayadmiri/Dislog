import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  auth: {
    user: "asanime84@gmail.com",
    pass: "ppia ruar orlj logn",
  },

});

const sendEmail = async (to:string, subject:string, text:string, html:string) => {
  const mailData = {
    from: "asanime84@gmail.com",
    to,
    subject,
    text,
    html,
  };
   transporter.sendMail(mailData, (err, info) => {
    if (err) {
      throw new Error(err.message)
    }
  });
};

export default sendEmail;