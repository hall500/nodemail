
'use strict';

const connectEnv = require('dotenv').config();

if (connectEnv.error) {
  console.log("You need to add an env file");
  process.exit();
}

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const nodemailer = require('nodemailer');
const config = require('./config.js');

const transporter = nodemailer.createTransport(config);
const cron = require('node-cron');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true
});

const EmailModel = new Schema({
  from: { type: String, default: `FLS Support <${process.env.MAIL_USER}>` },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  text: { type: String, required: true },
  sent: { type: Boolean, default: false },
  verify: { type: String, default: config.randomkey() },
  date: { type: Date, default: Date.now }
});

const EmailData = mongoose.model('Email', EmailModel);

cron.schedule('10 * * * *', () => {
  EmailData.find({ sent: false }, function (err, docs) {
    if(!err && docs.length > 0){
      docs.forEach((doc) => {
        const mailOptions = {
          from: doc.from,
          to: doc.to,
          subject: doc.subject,
          text: doc.text
        };

        transporter.verify(function(error, success) {
          if (error) {
            console.log("Unable to send mail");
          } else {
            console.log("Server is ready to take our messages");
            transporter.sendMail(params, function(error, info){
              if (error) {
                  console.log(error);
              } else {
                console.log("Email successfully sent to " + doc.to)
                EmailData.updateOne({_id: doc._id}, { sent: true }, function(err, info){
                  if(!err) console.log("Email updated successfully for " + doc.to);
                });
              }
            });
          }
        });
        
      });
    }
  });
});

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.use(function(req, res, next){
  try {
    const auth = req.headers.authorization;
    const api_key = req.headers.api_key;
    if(!auth || auth !== `Bearer ${process.env.APP_SECRET}`){
      throw 'Invalid user ID';
    }else if(!api_key && api_key !== `${process.env.API_KEY}`){
      throw 'Invalid user ID';
    }else{
      next();
    }
  } catch {
    res.status(401).json({
      error: "Invalid Request"
    });
  }
});

/* 
FOR GMAIL SMTP
With 2FA: use application password for logging in
Without 2FA: make sure less secure applications is set in account -> security
then use the account password
 */

app.get('/send-mail', function (req, res) {
  const name = req.body.name;
  const key = config.randomkey();
  const email = new EmailData({
    from: `Company Support <${req.body.from}>`,
    to: `${name} <${req.body.to}>`,
    subject: `${req.body.subject}`,
    text: `${req.body.text}`,
    verify: key
  });

  email.save(function (err) {
    if (!err) console.log("Success!");
  });

  res.send("Sending email...");
})

app.post('/create-user', function (req, res) {
  const name = req.body.name;
  const key = config.randomkey();
  const email = new EmailData({
    from: `Company Name <${process.env.MAIL_USER}>`,
    to: `${name} <${req.body.to}>`,
    subject: `Hi ${name}, please verify your Company account`,
    text: `Hi ${name},\n
    Thanks for joining Company Name! Please confirm your email address by clicking on the link below.
    We'll communicate with you from time to time via email so it's important that we have an up-to-date email address on file.
    https://signup.company.com/activate/${key}
    If you did not sign up for an Company company please disregard this email.
    Happy Learning,
    Company Support
    `,
    verify: key
  });

  email.save(function (err) {
    if (!err) console.log("Success!");
  });

  res.send("Sending email...");
});
 
app.listen(8080, () => {
  console.log('The server is now running on port 3000');
})