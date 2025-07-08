

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'selokark300@gmail.com',
        pass: 'rasd cjkk zrjy ajde'
    }
});

function sendOTP(email, otp) {
    const mailOptions = {
        from: 'selokark300@gmail.com',
        to: email,
        subject: 'Password Reset OTP MONE REKHO',
        text: `Your OTP to reset your password is: ${otp}`
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendOTP;
