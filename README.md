# nodemail
Email Queue management system using nodemailer

Sending emails with gmail can be quite troubling, most especially when you also need to test with live.
This mailer service provides a quick way to send live mails using nodemailer, Heroku and MongoDB or any other
suitable database platform you prefer. 
The structure is simple once this service is running on your heroku app, you can send a mail from other applications
without having to worry if the mail has been. 

CREATE MAIL - POST
on sending the required parameters the email details required to be sent are saved to the database and a verification code 
is provided. A cron job runs every minute picking one mail that hasn't been sent each time. This enables the complete abstraction
of the mailing system and preferably can be used in the replacement of mail sending with slower languages.

main application <-> mail server -> cron job (runs every minute)
