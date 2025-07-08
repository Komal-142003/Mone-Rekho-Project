const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./config/db');
const session = require('express-session');
const sendOTP = require('./routes/mailer')
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'process.env.SESSION_SECRET',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.engine('hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: {
        formatPrice: function(price) {
            const num = typeof price === 'string' ? parseFloat(price) : price;
            if (isNaN(num)) return '₹0.00';
            return '₹' + num.toFixed(2);
        },
        hasHighRating: function(rating) {
            return rating >= 4.7;
        },
        getBadgeType: function(rating) {
            if (rating >= 4.8) return 'Best Seller';
            if (rating >= 4.7) return 'Popular';
            if (rating >= 4.6) return 'Special';
            return '';
        },
        eq: function (a, b) {
            return a === b;
        }
    } 
}));
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    res.render('index', {
        layout: false,
        user: req.session.user || null 
    });
});
app.get('/gallery', (req, res) => {
    res.render('coming-soon', {
        layout: false,
        user: req.session.user || null 
    });
});
app.get('/reserve%20table', (req, res) => {
    res.render('coming-soon', {
        layout: false,
        user: req.session.user || null 
    });
});


app.get('/signup', (req, res) => {
    res.render('signup',{ layout: false });
});

app.post('/signup', (req, res) => {
    const { name, phone, email, password, confirmPassword } = req.body;

    if (!name || !phone || !email || !password || !confirmPassword) {
        return res.status(400).send('All fields are required');
    }

    if (password !== confirmPassword) {
        return res.status(400).send('Passwords do not match');
    }

    if (password.length < 6) {
        return res.status(400).send('Password must be at least 6 characters');
    }

    db.query('SELECT * FROM user WHERE user_email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            return res.status(409).send('Email already in use');
        }

        db.query(
            'INSERT INTO user (user_name, user_phone, user_email, user_password) VALUES (?, ?, ?, ?)',
            [name, phone, email, password],
            (err, results) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).send('Registration failed');
                }
                res.redirect('/login');
            }
        );
    });
});


app.get('/login', (req, res) => {
    res.render('login',{ layout: false });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).render('login', {
            layout: false,
            error: 'Email and password are required',
            email
        });
    }

    db.query('SELECT * FROM user WHERE user_email = ?', [email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).render('login', {
                layout: false,
                error: 'Database error occurred',
                email
            });
        }

        if (results.length === 0) {
            return res.status(401).render('login', {
                layout: false,
                error: 'Invalid email or password',
                email
            });
        }

        const user = results[0];

        if (password !== user.user_password) {
            return res.status(401).render('login', {
                layout: false,
                error: 'Invalid email or password',
                email
            });
            
        }

        req.session.user = {
            email: user.user_email
        };

        res.redirect('/');
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
});


app.get('/menu', (req, res) => {
    db.query('SELECT * FROM menu', (err, results) => {
        if (err) {
            console.error('Error fetching menu:', err);
            return res.status(500).send('Error loading menu');
        }
        
        const categories = [
            { name: 'all', display: 'All Items' },
            { name: 'Biriyani', display: 'Biryani' },
            { name: 'Fried Rice', display: 'Fried Rice' },
            { name: 'Rolls', display: 'Rolls' },
            { name: 'Starter', display: 'Starters' },
            { name: 'Desserts', display: 'Desserts' }
        ];
        
        res.render('menu', {
            layout:false,
            menuItems: results,
            categories,
            user: req.session.user || null
        });
    });
});





app.get('/forgot-password', (req, res) => {
    res.render('forgot-password', { layout: false });
});

app.post('/forgot-password', (req, res) => {
    const { email } = req.body;

    db.query('SELECT * FROM user WHERE user_email = ?', [email], (err, results) => {
        if (err || results.length === 0) {
            return res.render('forgot-password', {
                layout: false,
                error: 'Email not found'
            });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        req.session.otp = otp;
        req.session.email = email;

        sendOTP(email, otp)
            .then(() => {
                res.render('verify-otp', { layout: false, email });
            })
            .catch((error) => {
                console.error('Error sending OTP email:', error);
                res.render('forgot-password', {
                    layout: false,
                    error: 'Failed to send OTP email. Please try again.'
                });
            });
    });
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (req.session.otp === otp && req.session.email === email) {
        res.render('reset-password', { layout: false, email });
    } else {
        res.render('verify-otp', {
            layout: false,
            email,
            error: 'Invalid OTP'
        });
    }
});

app.post('/resend-otp', (req, res) => {
    const email = req.session.email;

    if (!email) {
        return res.redirect('/forgot-password');
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    req.session.otp = newOtp;

    sendOTP(email, newOtp)
        .then(() => {
            res.render('verify-otp', {
                layout: false,
                email,
                message: 'OTP has been resent successfully!'
            });
        })
        .catch((error) => {
            console.error('Error resending OTP:', error);
            res.render('verify-otp', {
                layout: false,
                email,
                error: 'Failed to resend OTP. Please try again.'
            });
        });
});


app.post('/reset-password', (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password.length < 6) {
        return res.render('reset-password', {
            layout: false,
            email,
            error: 'Password must be 6 characters min'
        });
    }

    if (password !== confirmPassword) {
        return res.render('reset-password', {
            layout: false,
            email,
            error: 'Passwords do not match'
        });
    }

    db.query('UPDATE user SET user_password = ? WHERE user_email = ?', [password, email], (err) => {
        if (err) {
            return res.render('reset-password', {
                layout: false,
                email,
                error: 'Failed to update password'
            });
        }

        req.session.otp = null;
        req.session.email = null;

        res.redirect('/login');
    });
});



//Middleware Parts
app.use((req, res, next) => {
    res.status(404).render('404', {
        title: '404 - Page Not Found',
        message: 'Oops! The page you are looking for does not exist.',
        layout:false
    });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('500', {
        title: '500 - Server Error',
        message: 'Something went wrong on our end.'
    });
});



app.listen(PORT, () => {
    console.log('Server is running on http://localhost:${PORT}');
});