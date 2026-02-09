const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Commission = require('../models/Commission');

// @desc    Admin dashboard analytics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboard = asyncHandler(async (req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const [totalOrders, totalRevenue, recentOrdersAgg, totalUsers, totalProducts, totalServices, pendingVendors, commissionsByStatus, usersByRole, revenueByDay, ordersByDay] = await Promise.all([
        Order.countDocuments({ status: { $ne: 'cancelled' } }),
        Order.aggregate([
            { $match: { status: { $nin: ['cancelled'] } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]).then(r => r[0]?.total || 0),
        Order.find({ status: { $ne: 'cancelled' } }).sort('-createdAt').limit(10).populate('buyer', 'name email').populate('products.product', 'title price').lean(),
        User.countDocuments(),
        Product.countDocuments(),
        Service.countDocuments(),
        User.countDocuments({ role: 'vendor', vendorStatus: 'pending' }),
        Commission.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
        Order.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo }, status: { $ne: 'cancelled' } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ])
    ]);

    const revenueLast30Days = revenueByDay?.reduce((sum, d) => sum + (d.revenue || 0), 0) ?? 0;
    const commissionsByStatusMap = (commissionsByStatus || []).reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});
    const usersByRoleMap = (usersByRole || []).reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});

    // Fill in missing days with zeros for smoother charts
    const days = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d.toISOString().slice(0, 10));
    }
    const revenueByDayMap = (revenueByDay || []).reduce((acc, x) => { acc[x._id] = x; return acc; }, {});
    const chartData = days.map(date => ({
        date,
        label: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: revenueByDayMap[date]?.revenue || 0,
        orders: revenueByDayMap[date]?.count || 0
    }));

    res.json({
        totalOrders,
        totalRevenue,
        revenueLast30Days,
        totalUsers,
        totalProducts,
        totalServices,
        pendingVendors,
        commissions: commissionsByStatusMap,
        usersByRole: usersByRoleMap,
        chartData,
        recentOrders: recentOrdersAgg
    });
});

// @desc    Get all orders (for admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({})
        .populate('products.product', 'title price images type')
        .populate('buyer', 'name email')
        .sort('-createdAt')
        .lean();
    res.json(orders);
});

// @desc    Get all vendors (for admin)
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getVendors = asyncHandler(async (req, res) => {
    const vendors = await User.find({ role: 'vendor' })
        .select('-password')
        .sort('-createdAt');
    res.json(vendors);
});

// @desc    Approve or reject vendor
// @route   PUT /api/admin/vendors/:id/approve
// @access  Private/Admin
const updateVendorStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Status must be "approved" or "rejected"');
    }

    const vendor = await User.findById(req.params.id);
    if (!vendor) {
        res.status(404);
        throw new Error('Vendor not found');
    }
    if (vendor.role !== 'vendor') {
        res.status(400);
        throw new Error('User is not a vendor');
    }

    vendor.vendorStatus = status;
    await vendor.save();

    const updated = await User.findById(vendor._id).select('-password');
    res.json(updated);
});

// @desc    Get all products (admin)
// @route   GET /api/admin/products
// @access  Private/Admin
const getProducts = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;

    let query = {};
    if (status) query.status = status;
    if (category) query.category = category;

    const [products, total] = await Promise.all([
        Product.find(query).populate('vendor', 'name email').populate('category', 'name slug').sort('-createdAt').skip(skip).limit(limit).lean(),
        Product.countDocuments(query)
    ]);

    res.json({
        products,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

// @desc    Update product (admin - disable/enable)
// @route   PATCH /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (req.body.isActive !== undefined) product.isActive = req.body.isActive;
    if (req.body.status) product.status = req.body.status;
    await product.save();

    const updated = await Product.findById(product._id).populate('vendor', 'name email');
    res.json(updated);
});

// @desc    Get all services (admin)
// @route   GET /api/admin/services
// @access  Private/Admin
const getServices = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [services, total] = await Promise.all([
        Service.find({}).populate('vendor', 'name email vendorProfile').sort('-createdAt').skip(skip).limit(limit).lean(),
        Service.countDocuments()
    ]);

    res.json({
        services,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

// @desc    Update service (admin - disable/enable)
// @route   PATCH /api/admin/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    if (req.body.isActive !== undefined) service.isActive = req.body.isActive;
    await service.save();

    const updated = await Service.findById(service._id).populate('vendor', 'name email');
    res.json(updated);
});

// @desc    Get all commissions (admin)
// @route   GET /api/admin/commissions
// @access  Private/Admin
const getCommissions = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let query = {};
    if (status) query.status = status;

    const [commissions, total] = await Promise.all([
        Commission.find(query)
            .populate('customer', 'name email')
            .populate('vendor', 'name email vendorProfile')
            .populate('service', 'title basePrice')
            .sort('-createdAt')
            .skip(skip)
            .limit(limit)
            .lean(),
        Commission.countDocuments(query)
    ]);

    res.json({
        commissions,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

// @desc    Get all users (admin) with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const role = req.query.role;
    const search = req.query.search;

    let query = {};
    if (role) query.role = role;
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const [users, total] = await Promise.all([
        User.find(query).select('-password').sort('-createdAt').skip(skip).limit(limit).lean(),
        User.countDocuments(query)
    ]);

    res.json({
        users,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
});

module.exports = {
    getDashboard,
    getOrders,
    getVendors,
    updateVendorStatus,
    getProducts,
    updateProduct,
    getServices,
    updateService,
    getCommissions,
    getUsers
};
