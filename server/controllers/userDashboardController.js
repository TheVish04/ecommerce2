const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Commission = require('../models/Commission');
const Product = require('../models/Product');

// @desc    Get customer dashboard stats
// @route   GET /api/users/dashboard
// @access  Private
const getUserDashboardStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    // 1. Total Orders
    const totalOrders = await Order.countDocuments({ buyer: userId });

    // 2. Active Commissions
    const activeCommissionsCount = await Commission.countDocuments({
        customer: userId,
        status: { $in: ['pending', 'accepted', 'in_progress'] }
    });

    // 3. Digital Downloads (Check orders for digital products)
    // This is expensive if many orders, but for MVP okay.
    // Better way: Aggregate.
    const digitalOrders = await Order.find({ buyer: userId }).populate('products.product', 'type');
    let digitalCount = 0;
    digitalOrders.forEach(order => {
        order.products.forEach(item => {
            if (item.product && item.product.type === 'digital') {
                digitalCount += item.quantity;
            }
        });
    });

    // 4. Recent Orders
    const recentOrders = await Order.find({ buyer: userId })
        .sort('-createdAt')
        .limit(5)
        .populate('products.product', 'title') // simplified
        .lean();

    // Transform for UI
    const recentOrdersFormatted = recentOrders.map(order => ({
        id: order._id,
        date: order.createdAt,
        total: order.totalAmount,
        status: order.status,
        items: order.products.length
    }));

    // 5. Active Commissions List
    const activeCommissions = await Commission.find({
        customer: userId,
        status: { $in: ['pending', 'accepted', 'in_progress'] }
    })
        .populate('service', 'title')
        .populate('vendor', 'name')
        .limit(3)
        .lean();

    res.json({
        totalOrders,
        digitalDownloads: digitalCount,
        activeCommissions: activeCommissionsCount,
        pendingReviews: 0, // Mock for now
        recentOrders: recentOrdersFormatted,
        activeCommissionList: activeCommissions
    });
});

module.exports = {
    getUserDashboardStats
};
