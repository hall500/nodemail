const nodemailer = require('nodemailer');
const connectEnv = require('dotenv').config();
const express = require('express');
const app = express();

if (connectEnv.error) {
  console.log("You need to add an env file");
  process.exit();
}

const options = {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
};

let transporter = nodemailer.createTransport(options);

app.get('/', function (req, res) {
  res.send('Hello World')
})

app.get('/mail', function (req, res) {
  const mailOptions = {
    from: `${process.env.MAIL_USER}`,
    to: 'hallhomoms22@gmail.com',
    subject: 'Email Test was completed',
    text: 'The email test completed successfully'
  };

  transporter.verify(function(error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log("Server is ready to take our messages");
    }
  });

  /* transporter.sendMail(mailOptions, function(error, info){
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
  }); */

  res.send("Result sent");
})
 
app.listen(3000, () => {
  console.log('The server is now running on port 3000');
})