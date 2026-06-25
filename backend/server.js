// server.js
// E-Cafe Management System - Backend Entry Point
// Deployable to Azure App Service (Node.js runtime)

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const menuRoutes = require('./routes/menuRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const categoryRoutes = require('./routes/categoryRoutes');

const app = express();

app.use(cors({
    origin: "https://ecafe-frontend-amanda.azurewebsites.net"
}));
app.use(express.json());

// Health check route (useful to verify Azure deployment is alive)
app.get('/', (req, res) => {
    res.send('E-Cafe Management System API is running.');
});

app.use('/api/menu', menuRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/categories', categoryRoutes);

// Azure App Service provides the PORT via environment variable
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`E-Cafe server running on port ${PORT}`);
});
