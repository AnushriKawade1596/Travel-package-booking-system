const express = require('express');
const router = express.Router();
const db = require('../config/database');

// GET All tours (with search, filter, sort)
router.get('/tours', async (req, res) => {
    try {
        let query = 'SELECT * FROM tours WHERE status = "active"';
        const params = [];

        // Search by destination
        if (req.query.search) {
            query += ' AND destination LIKE ?';
            params.push(`%${req.query.search}%`);
        }

        // Filter by category
        if (req.query.category) {
            query += ' AND category = ?';
            params.push(req.query.category);
        }

        // Sorting
        if (req.query.sort === 'price_asc') {
            query += ' ORDER BY price ASC';
        } else if (req.query.sort === 'price_desc') {
            query += ' ORDER BY price DESC';
        } else if (req.query.sort === 'duration') {
            query += ' ORDER BY duration ASC';
        } else {
            query += ' ORDER BY start_date ASC';
        }

        const [tours] = await db.query(query, params);

        res.render('tours', {
            tours,
            searchQuery: req.query.search || '',
            category: req.query.category || '',
            sort: req.query.sort || ''
        });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading tours');
        res.redirect('/');
    }
});

// GET Single tour details
router.get('/tours/:id', async (req, res) => {
    try {
        const [tours] = await db.query(
            `SELECT t.*, 
                    t.available_seats - COALESCE(SUM(b.number_of_people), 0) as available_seats
             FROM tours t
             LEFT JOIN bookings b ON t.id = b.tour_id AND b.status NOT IN ('cancelled')
             WHERE t.id = ? AND t.status = "active"
             GROUP BY t.id`,
            [req.params.id]
        );

        if (tours.length === 0) {
            req.flash('error_msg', 'Tour not found');
            return res.redirect('/tours');
        }

        res.render('tour-details', { tour: tours[0] });
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Error loading tour details');
        res.redirect('/tours');
    }
});

module.exports = router;