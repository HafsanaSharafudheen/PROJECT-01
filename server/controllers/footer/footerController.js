

async function messageSending(req,res){
    const nodemailer = require('nodemailer');
console.log(req.body,"oooooooooooooooooooooo")
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587, // Gmail SMTP port for TLS
        secure: false, // Use TLS, not SSL
        auth: {
            user: process.env.SMTP_USERNAME,
            pass: process.env.SMTP_PASSWORD,
        },
    });
    const mailOptions = {
        from: process.env.SMTP_USERNAME + "@gmail.com",
        to: req.body.email,
        subject: req.body.subject,
        text: req.body.message,
    };

    try {
        console.log(mailOptions);
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email: ' + error);
    }

}

module.exports = {
    
    messageSending:messageSending
  }
  