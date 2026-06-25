// routes/menuRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all menu items
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT m.*, c.category_name 
             FROM menu_items m 
             LEFT JOIN categories c ON m.category_id = c.category_id`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single menu item
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM menu_items WHERE item_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Item not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE new menu item
router.post('/', async (req, res) => {
    try {
        const { item_name, description, price, category_id, is_available } = req.body;
        const [result] = await db.query(
            `INSERT INTO menu_items (item_name, description, price, category_id, is_available) 
             VALUES (?, ?, ?, ?, ?)`,
            [item_name, description, price, category_id, is_available ?? true]
        );
        res.status(201).json({ item_id: result.insertId, message: 'Menu item created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// UPDATE menu item
router.put('/:id', async (req, res) => {
    try {
        const { item_name, description, price, category_id, is_available } = req.body;
        await db.query(
            `UPDATE menu_items 
             SET item_name=?, description=?, price=?, category_id=?, is_available=? 
             WHERE item_id=?`,
            [item_name, description, price, category_id, is_available, req.params.id]
        );
        res.json({ message: 'Menu item updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM menu_items WHERE item_id = ?', [req.params.id]);
        res.json({ message: 'Menu item deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
