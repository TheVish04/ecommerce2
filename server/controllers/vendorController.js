const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Commission = require('../models/Commission');

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/dashboard
// @access  Private/Vendor
const getVendorStats = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;

    // 1. Get Vendor Products
    const vendorProducts = await Product.find({ vendor: vendorId }).select('_id price title');
    const vendorProductIds = vendorProducts.map(p => p._id);

    // 2. Fetch Orders containing these products
    const orders = await Order.find({ 'products.product': { $in: vendorProductIds } })
        .populate('products.product', 'title price vendor')
        .populate('buyer', 'name')
        .sort('-createdAt');

    // 3. Fetch Commissions
    const commissions = await Commission.find({ vendor: vendorId })
        .populate('service', 'title')
        .populate('customer', 'name')
        .sort('-createdAt');

    // 4. Calculate Stats
    let totalSales = 0;
    let totalEarnings = 0;
    let pendingOrdersCount = 0;

    // Process Orders for Calc
    const recentActivity = [];

    // Helper to calculate order slice for this vendor
    const getOrderValueForVendor = (order) => {
        let val = 0;
        order.products.forEach(item => {
            if (item.product && item.product.vendor && item.product.vendor.toString() === vendorId.toString()) {
                val += (item.product.price * item.quantity);
            }
        });
        return val;
    };

    orders.forEach(order => {
        const orderVal = getOrderValueForVendor(order);

        // Total Sales (Gross) - All non-cancelled orders
        if (order.status !== 'cancelled') {
            totalSales += orderVal;
        }

        // Total Earnings (Net) - Only completed
        if (order.status === 'completed' || order.status === 'delivered') {
            totalEarnings += orderVal;
        }

        // Pending Orders
        if (order.status === 'pending' || order.status === 'processing') {
            pendingOrdersCount++;
        }

        // Activity Feed: New Order
        recentActivity.push({
            type: 'order',
            title: 'New Order Received',
            desc: `Order #${order._id.toString().slice(-6).toUpperCase()} - ₹${orderVal}`,
            date: order.createdAt,
            status: order.status
        });
    });

    // Process Commissions for Calc (Add to earnings?)
    commissions.forEach(comm => {
        // If commission is completed, add to earnings
        if (['completed', 'delivered'].includes(comm.status)) {
            totalEarnings += (comm.budget || 0);
            totalSales += (comm.budget || 0); // Assuming budget is price
        }

        // Activity Feed: Commission
        recentActivity.push({
            type: 'commission',
            title: 'Commission Request',
            desc: `${comm.service?.title} from ${comm.customer?.name}`,
            date: comm.createdAt,
            status: comm.status
        });
    });

    // Sort Activity by Date (Designated 5 topmost)
    recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentActivitySlice = recentActivity.slice(0, 5);

    // 5. Sales Analytics (Last 30 Days)
    const analyticsMap = new Map();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Initialize map with empty dates
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        analyticsMap.set(dateStr, 0);
    }

    orders.forEach(order => {
        const d = new Date(order.createdAt);
        if (d >= thirtyDaysAgo && order.status !== 'cancelled') {
            const dateStr = d.toISOString().split('T')[0];
            const val = getOrderValueForVendor(order);
            if (analyticsMap.has(dateStr)) {
                analyticsMap.set(dateStr, analyticsMap.get(dateStr) + val);
            }
        }
    });

    // Convert map to array for Recharts
    const salesAnalytics = Array.from(analyticsMap, ([date, value]) => ({ date, sales: value })).reverse();


    res.json({
        totalProducts: vendorProducts.length,
        totalSales,
        totalEarnings, // Net revenue
        pendingOrders: pendingOrdersCount + commissions.filter(c => c.status === 'pending').length,
        recentActivity: recentActivitySlice,
        salesAnalytics
    });
});

// @desc    Get vendor orders
// @route   GET /api/vendor/orders
// @access  Private/Vendor
const getVendorOrders = asyncHandler(async (req, res) => {
    const vendorId = req.user.id;
    // Get products first
    const vendorProducts = await Product.find({ vendor: vendorId }).select('_id');
    const ids = vendorProducts.map(p => p._id);

    const orders = await Order.find({ 'products.product': { $in: ids } })
        .populate('products.product', 'title price vendor')
        .populate('buyer', 'name email')
        .sort('-createdAt');

    // Transform orders to vendor view
    const vendorOrders = orders.map(order => {
        // Calculate amount specfic to this vendor
        let vendorAmount = 0;
        let vendorItems = [];
        order.products.forEach(item => {
            // Check if product belongs to vendor
            if (item.product && item.product.vendor.toString() === vendorId) {
                vendorAmount += item.product.price * item.quantity;
                vendorItems.push(item.product.title);
            }
        });

        return {
            _id: order._id,
            customer: order.buyer ? order.buyer.name : 'Unknown User',
            product: vendorItems.join(', '), // List items
            amount: vendorAmount,
            status: order.status,
            date: order.createdAt
        };
    });

    res.json(vendorOrders);
});

// @desc    Get vendor payouts (Mock or real if needed)
// @route   GET /api/vendor/payouts
// @access  Private/Vendor
const getVendorPayouts = asyncHandler(async (req, res) => {
    // For now we mock based on earnings or just static
    // Ideally requires a Transaction model
    res.json({
        availableBalance: 24500, // Mock
        nextPayout: 12500, // Mock
        history: []
    });
});

module.exports = {
    getVendorStats,
    getVendorOrders,
    getVendorPayouts
};
