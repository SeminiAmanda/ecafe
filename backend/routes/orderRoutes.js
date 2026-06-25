// routes/orderRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET all orders (with customer name)
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT o.*, c.name AS customer_name 
             FROM orders o 
             LEFT JOIN customers c ON o.customer_id = c.customer_id 
             ORDER BY o.order_date DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET single order with its items
router.get('/:id', async (req, res) => {
    try {
        const [order] = await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id]);
        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

        const [items] = await db.query(
            `SELECT oi.*, m.item_name, m.price 
             FROM order_items oi 
             JOIN menu_items m ON oi.item_id = m.item_id 
             WHERE oi.order_id = ?`,
            [req.params.id]
        );
        res.json({ ...order[0], items });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// CREATE new order
// Expected body: { customer_id: 1, items: [{ item_id: 1, quantity: 2 }, ...] }
router.post('/', async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { customer_id, items } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'Order must include at least one item' });
        }

        await conn.beginTransaction();

        const [orderResult] = await conn.query(
            'INSERT INTO orders (customer_id, status, total_amount) VALUES (?, ?, 0)',
            [customer_id, 'Pending']
        );
        const orderId = orderResult.insertId;

        let total = 0;
        for (const it of items) {
            const [menuItem] = await conn.query('SELECT price FROM menu_items WHERE item_id = ?', [it.item_id]);
            if (menuItem.length === 0) throw new Error(`Menu item ${it.item_id} not found`);

            const subtotal = menuItem[0].price * it.quantity;
            total += subtotal;

            await conn.query(
                'INSERT INTO order_items (order_id, item_id, quantity, subtotal) VALUES (?, ?, ?, ?)',
                [orderId, it.item_id, it.quantity, subtotal]
            );
        }

        await conn.query('UPDATE orders SET total_amount = ? WHERE order_id = ?', [total, orderId]);
        await conn.commit();

        res.status(201).json({ order_id: orderId, total_amount: total, message: 'Order placed successfully' });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// UPDATE order status (Pending -> Preparing -> Completed / Cancelled)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id]);
        res.json({ message: `Order status updated to ${status}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE order
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM orders WHERE order_id = ?', [req.params.id]);
        res.json({ message: 'Order deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
