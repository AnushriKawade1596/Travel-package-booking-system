const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

// Admin middleware
router.use(ensureAuthenticated);
router.use(ensureAdmin);

// GET Admin dashboard
router.get('/dashboard', async (req, res) => {
    try {
        // Get statistics
        const [totalTours] = await db.query('SELECT COUNT(*) as count FROM tours');
        const [totalBookings] = await db.query('SELECT COUNT(*) as count FROM bookings');
        const [totalUsers] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "customer"');
        const [totalRevenue] = await db.query('SELECT SUM(total_price) as revenue FROM bookings WHERE status = "confirmed"');

        // Recent bookings
        const [recentBookings] = await db.query(
            `SELECT b.*, u.name as user_name, t.name as tour_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN tours t ON b.tour_id = t.id
             ORDER BY b.created_at DESC
             LIMIT 10`
        );

        res.render('admin/dashboard', {
            stats: {
                tours: totalTours[0].count,
                bookings: totalBookings[0].count,
                users: totalUsers[0].count,
                revenue: totalRevenue[0].revenue || 0
            },
            recentBookings
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading dashboard');
        res.redirect('/');
    }
});

// GET Manage tours (CRUD - READ all)
router.get('/tours', async (req, res) => {
    try {
        const [tours] = await db.query('SELECT * FROM tours ORDER BY created_at DESC');
        res.render('admin/manage-tours', { tours });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading tours');
        res.redirect('/admin/dashboard');
    }
});

// GET Add tour form (CRUD - CREATE)
router.get('/tours/add', (req, res) => {
    res.render('admin/add-tour');
});

// POST Add tour (CRUD - CREATE)
router.post('/tours', async (req, res) => {
    try {
        const {
            name, destination, duration, price, max_group_size,
            available_seats, description, image_url, start_date,
            end_date, category, is_featured
        } = req.body;

        await db.query(
            `INSERT INTO tours (name, destination, duration, price, max_group_size, 
             available_seats, description, image_url, start_date, end_date, category, is_featured)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [name, destination, duration, price, max_group_size, available_seats,
                description, image_url, start_date, end_date, category, is_featured || 0]
        );

        req.flash('success_msg', 'Tour added successfully');
        res.redirect('/admin/tours');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error adding tour');
        res.redirect('/admin/tours/add');
    }
});

// GET Edit tour form (CRUD - UPDATE)
router.get('/tours/:id/edit', async (req, res) => {
    try {
        const [tours] = await db.query('SELECT * FROM tours WHERE id = ?', [req.params.id]);
        if (tours.length === 0) {
            req.flash('error_msg', 'Tour not found');
            return res.redirect('/admin/tours');
        }
        res.render('admin/edit-tour', { tour: tours[0] });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading tour');
        res.redirect('/admin/tours');
    }
});

// PUT Update tour (CRUD - UPDATE)
router.put('/tours/:id', async (req, res) => {
    try {
        const {
            name, destination, duration, price, max_group_size,
            available_seats, description, image_url, start_date,
            end_date, category, is_featured, status
        } = req.body;

        await db.query(
            `UPDATE tours SET 
             name = ?, destination = ?, duration = ?, price = ?, max_group_size = ?,
             available_seats = ?, description = ?, image_url = ?, start_date = ?,
             end_date = ?, category = ?, is_featured = ?, status = ?
             WHERE id = ?`,
            [name, destination, duration, price, max_group_size, available_seats,
                description, image_url, start_date, end_date, category, is_featured || 0,
                status, req.params.id]
        );

        req.flash('success_msg', 'Tour updated successfully');
        res.redirect('/admin/tours');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating tour');
        res.redirect(`/admin/tours/${req.params.id}/edit`);
    }
});

// DELETE Remove tour (CRUD - DELETE)
router.delete('/tours/:id', async (req, res) => {
    try {
        // Check if tour has bookings
        const [bookings] = await db.query(
            'SELECT COUNT(*) as count FROM bookings WHERE tour_id = ?',
            [req.params.id]
        );

        if (bookings[0].count > 0) {
            req.flash('error_msg', 'Cannot delete tour with existing bookings');
            return res.redirect('/admin/tours');
        }

        await db.query('DELETE FROM tours WHERE id = ?', [req.params.id]);
        req.flash('success_msg', 'Tour deleted successfully');
        res.redirect('/admin/tours');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error deleting tour');
        res.redirect('/admin/tours');
    }
});

// GET Manage bookings
router.get('/bookings', async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, u.name as user_name, u.email as user_email, t.name as tour_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN tours t ON b.tour_id = t.id
             ORDER BY b.created_at DESC`
        );
        res.render('admin/manage-bookings', { bookings });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading bookings');
        res.redirect('/admin/dashboard');
    }
});

// PUT Update booking status
router.put('/bookings/:id', async (req, res) => {
    try {
        const { status, payment_status } = req.body;

        await db.query(
            'UPDATE bookings SET status = ?, payment_status = ? WHERE id = ?',
            [status, payment_status, req.params.id]
        );

        req.flash('success_msg', 'Booking updated successfully');
        res.redirect('/admin/bookings');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error updating booking');
        res.redirect('/admin/bookings');
    }
});

module.exports = router;