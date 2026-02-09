const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const DownloadAccess = require('./models/DownloadAccess');

dotenv.config();

async function seedDownloads() {
    try {
        await connectDB();

        console.log('Seeding sample digital download data...');

        // 1. Find or create a demo customer
        let user = await User.findOne({ email: 'demo.customer@kalavpp.com' });
        if (!user) {
            user = await User.create({
                name: 'Demo Customer',
                email: 'demo.customer@kalavpp.com',
                password: 'Password@123', // hashed by pre-save hook if defined; otherwise change manually later
                role: 'customer',
                isVerified: true
            });
            console.log(`Created demo user: ${user.email}`);
        } else {
            console.log(`Using existing demo user: ${user.email}`);
        }

        // 2. Find or create a simple digital product
        let product = await Product.findOne({ type: 'digital' });
        if (!product) {
            console.log('No digital product found. Creating a simple sample product.');
            product = await Product.create({
                vendor: user._id, // or change to an existing vendor id
                title: 'Sample Digital Artwork',
                description: 'Demo digital asset for Downloads page seeding.',
                price: 0,
                category: null,
                type: 'digital',
                images: ['https://via.placeholder.com/800x600.png?text=KalaVPP+Digital+Art'],
                downloadUrl: 'https://via.placeholder.com/1600x1200.png?text=KalaVPP+Download',
                status: 'active',
                isActive: true
            });
            console.log(`Created sample digital product: ${product.title}`);
        } else {
            console.log(`Using existing digital product: ${product.title}`);
            if (!product.downloadUrl) {
                product.downloadUrl = 'https://via.placeholder.com/1600x1200.png?text=KalaVPP+Download';
                await product.save();
                console.log('Added demo downloadUrl to existing product.');
            }
        }

        // 3. Create a paid order for this user and product
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
        console.log(`Created order ${order._id} for demo customer.`);

        // 4. Create DownloadAccess entry
        await DownloadAccess.create({
            user: user._id,
            order: order._id,
            product: product._id,
            maxDownloads: null,
            expiresAt: null
        });
        console.log('Created DownloadAccess entry for demo order.');

        console.log('Seed complete. You can now log in as demo.customer@kalavpp.com and see a download on the Downloads page (after setting the password if needed).');
    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
}

seedDownloads();

