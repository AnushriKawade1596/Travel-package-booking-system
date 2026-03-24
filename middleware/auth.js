const ensureAuthenticated = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please login to access this page');
    res.redirect('/auth/login');
};

const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    req.flash('error_msg', 'Access denied. Admin only.');
    res.redirect('/');
};

module.exports = { ensureAuthenticated, ensureAdmin };