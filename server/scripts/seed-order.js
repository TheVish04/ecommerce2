/**
 * Seed script: Add one example order for customer vishal@gmail.com
 * Run: node scripts/seed-order.js
 */
require('dotenv').config();
require('colors');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const connectDB = require('../config/db');

async function seedOrder() {
    try {
        await connectDB();

        const customer = await User.findOne({ email: 'vishal@gmail.com' });
        if (!customer) {
            console.error('Customer vishal@gmail.com not found. Please create the user first.');
            process.exit(1);
        }

        const product = await Product.findOne({ status: 'active', isActive: true });
        if (!product) {
            console.error('No active product found. Please add a product first.');
            process.exit(1);
        }

        const order = await Order.create({
            buyer: customer._id,
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    options: {}
                }
            ],
            shippingAddress: {
                street: '123 Example Street',
                city: 'Mumbai',
                state: 'Maharashtra',
                pincode: '400001',
                phone: '9876543210'
            },
            totalAmount: product.price,
            currency: 'INR',
            status: 'pending',
            paymentStatus: 'pending'
        });

        console.log('Example order created successfully!');
        console.log('  Order ID:', order._id.toString());
        console.log('  Customer:', customer.email);
        console.log('  Product:', product.title);
        console.log('  Total: ₹' + order.totalAmount);
        console.log('  Status:', order.status);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding order:', error.message);
        process.exit(1);
    }
}

seedOrder();
