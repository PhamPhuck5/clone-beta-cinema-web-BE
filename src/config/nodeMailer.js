import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_NAME,
    pass: process.env.GMAIL_SECRET,
  },
});

// let testAccount = await nodemailer.createTestAccount();

// let transporter = nodemailer.createTransport({
//   host: "smtp.ethereal.email",
//   port: 587,
//   secure: false,
//   auth: {
//     user: testAccount.user,
//     pass: testAccount.pass,
//   },
// });

export const changePasswordEmail = async (userEmail, newPassword) => {
  const mailOptions = {
    from: "youremail@gmail.com",
    to: userEmail,
    subject: "Change beta cinema",
    text: "your new password is: " + newPassword,
  };
  let info = await transporter.sendMail(mailOptions);
  console.log("Email sent: " + info.response);
  console.log("📩 Preview URL:", nodemailer.getTestMessageUrl(info));
};
