const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const DownloadAccess = require('./models/DownloadAccess');

dotenv.config();

const TARGET_EMAIL = 'customer@gmail.com';

async function seedDownloadsForCustomer() {
    try {
        await connectDB();

        console.log(`Seeding digital download data for ${TARGET_EMAIL}...`);

        const user = await User.findOne({ email: TARGET_EMAIL });
        if (!user) {
            console.error(`User with email ${TARGET_EMAIL} not found. Aborting.`);
            process.exit(1);
        }
        console.log(`Using existing user: ${user.email}`);

        let product = await Product.findOne({ type: 'digital' });
        if (!product) {
            console.error('No digital product found. Please create at least one digital product first.');
            process.exit(1);
        }

        if (!product.downloadUrl) {
            product.downloadUrl = 'https://via.placeholder.com/1600x1200.png?text=KalaVPP+Download';
            await product.save();
            console.log('Added demo downloadUrl to existing digital product.');
        }

        const order = await Order.create({
            buyer: user._id,
            products: [
                {
                    product: product._id,
                    quantity: 1,
                    options: {}
                }
            ],
            lineItems: [
                {
                    itemType: 'product',
                    product: product._id,
                    quantity: 1,
                    unitPrice: product.price,
                    options: {}
                }
            ],
            totalAmount: product.price,
            shippingAddress: {},
            status: 'completed',
            paymentStatus: 'paid'
        });
        console.log(`Created order ${order._id} for ${user.email}.`);

        await DownloadAccess.create({
            user: user._id,
            order: order._id,
            product: product._id,
            maxDownloads: null,
            expiresAt: null
        });
        console.log('Created DownloadAccess entry for that order.');

        console.log('Seed complete. customer@gmail.com now has at least one digital download.');
    } catch (err) {
        console.error('Seed for customer failed:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedDownloadsForCustomer();

