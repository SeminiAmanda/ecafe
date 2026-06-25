-- E-Cafe Management System Database Schema
-- Compatible with MySQL (Azure Database for MySQL Flexible Server)

CREATE DATABASE IF NOT EXISTS ecafe_db;
USE ecafe_db;

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL
);

-- Table: menu_items
CREATE TABLE IF NOT EXISTS menu_items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

-- Table: customers
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100)
);

-- Table: orders
CREATE TABLE IF NOT EXISTS orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'Pending',   -- Pending, Preparing, Completed, Cancelled
    total_amount DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Table: order_items (junction table)
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    item_id INT,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

-- Sample data
INSERT INTO categories (category_name) VALUES
('Beverages'), ('Snacks'), ('Desserts'), ('Breakfast');

INSERT INTO menu_items (item_name, description, price, category_id) VALUES
('Cappuccino', 'Rich espresso with steamed milk foam', 350.00, 1),
('Cold Coffee', 'Iced coffee blended with milk', 400.00, 1),
('Veg Sandwich', 'Grilled sandwich with fresh veggies', 450.00, 2),
('French Fries', 'Crispy golden fries', 380.00, 2),
('Chocolate Brownie', 'Warm brownie with chocolate sauce', 420.00, 3),
('Pancakes', 'Stack of pancakes with maple syrup', 500.00, 4);

INSERT INTO customers (name, phone, email) VALUES
('Nimal Perera', '0771234567', 'nimal@example.com'),
('Saman Silva', '0719876543', 'saman@example.com');
