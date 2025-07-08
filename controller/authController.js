const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
// const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'selokark300@gmail.com',
        pass: 'rasd cjkk zrjy ajde'
    }
});

function generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
}

const otpStore = new Map();

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        const [users] = await pool.query('SELECT * FROM user WHERE user_email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Email not found' 
            });
        }
        
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 15 * 60 * 1000,
            verified: false
        });
        
        const mailOptions = {
            from: 'saumyajyotibanik@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nThis OTP is valid for 15 minutes.`,
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true,
            message: 'OTP sent to your email' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false,
                message: 'Email is required' 
            });
        }

        const [users] = await pool.query('SELECT * FROM user WHERE user_email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Email not found' 
            });
        }
        
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 15 * 60 * 1000,
            verified: false
        });
        
        const mailOptions = {
            from: 'saumyajyotibanik@gmail.com',
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nThis OTP is valid for 15 minutes.`,
            html: `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true,
            message: 'OTP sent to your email' 
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        
        if (error.code === 'EAUTH' || error.code === 'EENVELOPE') {
            return res.status(500).json({ 
                success: false,
                message: 'Failed to send email. Please try again later.' 
            });
        }
        
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                success: false,
                message: 'Database connection failed. Please try again later.' 
            });
        }
        
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        const otpData = otpStore.get(email);
        if (!otpData || otpData.expiresAt < Date.now()) {
            return res.status(400).json({ 
                success: false,
                message: 'OTP expired or invalid' 
            });
        }
        
        if (otpData.otp !== otp) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid OTP' 
            });
        }
        
        otpData.verified = true;
        otpStore.set(email, otpData);
        
        res.json({ 
            success: true,
            message: 'OTP verified successfully',
            email: email
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        const otp = generateOTP();
        otpStore.set(email, {
            otp,
            expiresAt: Date.now() + 15 * 60 * 1000,
            verified: false
        });
        
        const mailOptions = {
            from: 'saumyajyotibanik@gmail.com',
            to: email,
            subject: 'New Password Reset OTP',
            text: `Your new OTP for password reset is: ${otp}\nThis OTP is valid for 15 minutes.`,
            html: `<p>Your new OTP for password reset is: <strong>${otp}</strong></p><p>This OTP is valid for 15 minutes.</p>`
        };
        
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true,
            message: 'New OTP sent to your email' 
        });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                message: 'Email and new password are required' 
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ 
                success: false, 
                message: 'Password must be at least 6 characters' 
            });
        }

        const otpData = otpStore.get(email);
        if (!otpData || !otpData.verified) {
            return res.status(400).json({ 
                success: false, 
                message: 'OTP verification required' 
            });
        }

        

        const [result] = await pool.query(
            'UPDATE user SET user_password = ? WHERE user_email = ?', 
            [newPassword, email]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'User not found' 
            });
        }

        otpStore.delete(email);

        res.status(200).json({ 
            success: true, 
            message: 'Password reset successfully' 
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
        });
    }
};