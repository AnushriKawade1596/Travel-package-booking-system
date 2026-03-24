const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { ensureAuthenticated } = require('../middleware/auth');

// POST Create booking (CRUD - CREATE)
router.post('/', ensureAuthenticated, async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { tour_id, number_of_people, special_requests } = req.body;
        const user_id = req.session.user.id;

        // Get tour details with lock
        const [tours] = await connection.query(
            'SELECT price, available_seats FROM tours WHERE id = ? FOR UPDATE',
            [tour_id]
        );

        if (tours.length === 0) {
            throw new Error('Tour not found');
        }

        const tour = tours[0];

        // Check seat availability
        const [booked] = await connection.query(
            'SELECT COALESCE(SUM(number_of_people), 0) as booked FROM bookings WHERE tour_id = ? AND status NOT IN ("cancelled")',
            [tour_id]
        );

        const availableSeats = tour.available_seats - booked[0].booked;

        if (availableSeats < number_of_people) {
            throw new Error('Not enough seats available');
        }

        // Calculate total price
        const total_price = tour.price * number_of_people;

        // Create booking
        const [result] = await connection.query(
            `INSERT INTO bookings (user_id, tour_id, number_of_people, total_price, special_requests, status) 
             VALUES (?, ?, ?, ?, ?, 'pending')`,
            [user_id, tour_id, number_of_people, total_price, special_requests]
        );

        await connection.commit();

        req.flash('success_msg', 'Booking created successfully! Please complete payment to confirm.');
        res.redirect('/bookings/my-bookings');
    } catch (error) {
        await connection.rollback();
        console.error(error);
        req.flash('error_msg', error.message || 'Booking failed');
        res.redirect(`/tours/${req.body.tour_id}`);
    } finally {
        connection.release();
    }
});

// GET User's bookings (CRUD - READ)
router.get('/my-bookings', ensureAuthenticated, async (req, res) => {
    try {
        const [bookings] = await db.query(
            `SELECT b.*, t.name as tour_name, t.destination, t.start_date, t.end_date, t.image_url
             FROM bookings b
             JOIN tours t ON b.tour_id = t.id
             WHERE b.user_id = ?
             ORDER BY b.booking_date DESC`,
            [req.session.user.id]
        );

        res.render('my-bookings', { bookings });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading bookings');
        res.redirect('/');
    }
});

// DELETE Cancel booking (CRUD - DELETE)
router.delete('/:id', ensureAuthenticated, async (req, res) => {
    try {
        const [result] = await db.query(
            `UPDATE bookings 
             SET status = 'cancelled', cancellation_reason = ?, cancelled_at = NOW()
             WHERE id = ? AND user_id = ? AND status IN ('pending', 'confirmed')`,
            ['User cancelled', req.params.id, req.session.user.id]
        );

        if (result.affectedRows === 0) {
            req.flash('error_msg', 'Booking not found or cannot be cancelled');
        } else {
            req.flash('success_msg', 'Booking cancelled successfully');
        }

        res.redirect('/bookings/my-bookings');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error cancelling booking');
        res.redirect('/bookings/my-bookings');
    }
});

// PUT Update booking (CRUD - UPDATE) - e.g., modify number of people
router.put('/:id', ensureAuthenticated, async (req, res) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        const { number_of_people } = req.body;
        const bookingId = req.params.id;

        // Get booking details
        const [bookings] = await connection.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ? AND status = "pending"',
            [bookingId, req.session.user.id]
        );

        if (bookings.length === 0) {
            throw new Error('Booking not found or cannot be modified');
        }

        const booking = bookings[0];

        // Get tour price
        const [tours] = await connection.query(
            'SELECT price FROM tours WHERE id = ?',
            [booking.tour_id]
        );

        const total_price = tours[0].price * number_of_people;

        // Update booking
        await connection.query(
            'UPDATE bookings SET number_of_people = ?, total_price = ? WHERE id = ?',
            [number_of_people, total_price, bookingId]
        );

        await connection.commit();

        req.flash('success_msg', 'Booking updated successfully');
        res.redirect('/bookings/my-bookings');
    } catch (error) {
        await connection.rollback();
        console.error(error);
        req.flash('error_msg', error.message);
        res.redirect('/bookings/my-bookings');
    } finally {
        connection.release();
    }
});

module.exports = router;