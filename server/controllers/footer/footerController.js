

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
        subject: "Baby bundle replay",
        text: "Thank you for reaching out to us! We have received your inquiry, and our dedicated team will promptly review and respond to your query about"+req.body.message+".We appreciate your patience and look forward to assisting you with any information or support you may need. Feel free to reach out if you have any further questions or requests. Best regards,Baby Bundles",
    };

    try {
        console.log(mailOptions);
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Done' });
    } catch (error) {
        console.error('Error sending email: ' + error);
        res.status(500).json({ error: 'Error sending email' });

    }

}

module.exports = {
    messageSending:messageSending
  }
  