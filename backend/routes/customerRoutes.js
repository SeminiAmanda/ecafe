// routes/customerRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all customers
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM customers');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE new customer
router.post('/', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        const [result] = await db.query(
            'INSERT INTO customers (name, phone, email) VALUES (?, ?, ?)',
            [name, phone, email]
        );
        res.status(201).json({ customer_id: result.insertId, message: 'Customer added' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE customer
router.put('/:id', async (req, res) => {
    try {
        const { name, phone, email } = req.body;
        await db.query(
            'UPDATE customers SET name=?, phone=?, email=? WHERE customer_id=?',
            [name, phone, email, req.params.id]
        );
        res.json({ message: 'Customer updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM customers WHERE customer_id = ?', [req.params.id]);
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
