const asyncHandler = require('express-async-handler');
const Commission = require('../models/Commission');
const User = require('../models/User');
const Service = require('../models/Service');

// @desc    Create a new commission request
// @route   POST /api/commissions
// @access  Private
const createCommission = asyncHandler(async (req, res) => {
    const { serviceId, description, budget, deadline, referenceImages } = req.body;

    if (!serviceId || !description || !budget || !deadline) {
        res.status(400);
        throw new Error('Please fill in all fields');
    }

    const service = await Service.findById(serviceId);
    if (!service) {
        res.status(404);
        throw new Error('Service not found');
    }

    const commission = await Commission.create({
        service: serviceId,
        customer: req.user.id,
        vendor: service.vendor,
        description,
        budget,
        deadline,
        referenceImages: referenceImages || [],
        status: 'pending'
    });

    res.status(201).json(commission);
});

// @desc    Get user commissions (as customer or vendor)
// @route   GET /api/commissions
// @access  Private
const getCommissions = asyncHandler(async (req, res) => {
    const { role } = req.query;

    let query = {};
    if (role === 'vendor') {
        query = { vendor: req.user.id };
    } else if (role === 'customer') {
        query = { customer: req.user.id };
    } else {
        query = {
            $or: [{ customer: req.user.id }, { vendor: req.user.id }]
        };
    }

    const commissions = await Commission.find(query)
        .populate('customer', 'name email avatarUrl')
        .populate('vendor', 'name email vendorProfile')
        .populate('service', 'title price deliveryTime basePrice')
        .sort('-createdAt');

    res.json(commissions);
});

// @desc    Update commission status
// @route   PUT /api/commissions/:id/status
// @access  Private (Vendor only mostly, but maybe client can cancel?)
const updateCommissionStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    // Verify ownership
    if (commission.vendor.toString() !== req.user.id && commission.customer.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    // Vendor transitions
    if (commission.vendor.toString() === req.user.id) {
        if (['accepted', 'rejected', 'in_progress', 'completed', 'delivered'].includes(status)) {
            commission.status = status;
        }
    }

    // Customer transitions (e.g. cancel)
    if (commission.customer.toString() === req.user.id) {
        if (status === 'cancelled' && commission.status === 'pending') {
            commission.status = status;
        }
    }

    const updatedCommission = await commission.save();
    res.json(updatedCommission);
});

// @desc    Upload delivery files
// @route   PUT /api/commissions/:id/delivery
// @access  Private (Vendor only)
const uploadDelivery = asyncHandler(async (req, res) => {
    const { deliveryFiles } = req.body; // Array of { url, name }
    const commission = await Commission.findById(req.params.id);

    if (!commission) {
        res.status(404);
        throw new Error('Commission not found');
    }

    if (commission.vendor.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized as vendor');
    }

    if (deliveryFiles && deliveryFiles.length > 0) {
        commission.deliveryFiles = [...commission.deliveryFiles, ...deliveryFiles];
        commission.status = 'delivered'; // Auto update status? Prompt says "Upload delivery files... Mark Completed". Let's just upload for now, user can mark delivered manually or we do it here. 
        // Let's set it to 'delivered' as a convenience or just add files.
        // Prompt sequence: "Upload delivery files (Cloudinary) -> Mark Completed".
        // It's safer to just add files. Status change can be separate or implicit.
        // Let's leave status change to the manual "Update Status" or implied here.
        // I'll update status to 'delivered' if files are added, it makes sense.
        commission.status = 'delivered';
    }

    const updatedCommission = await commission.save();
    res.json(updatedCommission);
});

module.exports = {
    createCommission,
    getCommissions,
    updateCommissionStatus,
    uploadDelivery
};
