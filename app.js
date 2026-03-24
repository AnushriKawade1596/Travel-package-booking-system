const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Database connection
const db = require('./config/database');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Flash messages
app.use(flash());

// Make session user available to all views
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
});

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Import routes
const authRoutes = require('./routes/auth');
const tourRoutes = require('./routes/tours');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/auth', authRoutes);
app.use('/', tourRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admin', adminRoutes);

// Home page
app.get('/', async (req, res) => {
    try {
        const [featuredTours] = await db.query(
            'SELECT * FROM tours WHERE is_featured = 1 AND status = "active" LIMIT 6'
        );
        res.render('index', { featuredTours });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading homepage');
        res.render('index', { featuredTours: [] });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    req.flash('error_msg', 'Something went wrong!');
    res.status(500).redirect('back');
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});