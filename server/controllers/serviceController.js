const asyncHandler = require('express-async-handler');
const Service = require('../models/Service');
const { cloudinary } = require('../config/cloudinary');

// @desc    Get all vendor services
// @route   GET /api/vendor/services
// @access  Private/Vendor
const getVendorServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ vendor: req.user.id }).sort('-createdAt');
    res.json(services);
});

// @desc    Get service by ID
// @route   GET /api/vendor/services/:id
// @access  Private/Vendor
const getServiceById = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (service) {
        if (service.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }
        res.json(service);
    } else {
        res.status(404);
        throw new Error('Service not found');
    }
});

// @desc    Create a service
// @route   POST /api/vendor/services
// @access  Private/Vendor
const createService = asyncHandler(async (req, res) => {
    const { title, description, basePrice, deliveryTime } = req.body;

    let coverImage = '';
    if (req.file) {
        coverImage = req.file.path;
    }

    const service = new Service({
        vendor: req.user.id,
        title,
        description,
        basePrice,
        coverImage,
        deliveryTime,
        isActive: true
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
});

// @desc    Update a service
// @route   PUT /api/vendor/services/:id
// @access  Private/Vendor
const updateService = asyncHandler(async (req, res) => {
    const { title, description, basePrice, deliveryTime } = req.body;

    const service = await Service.findById(req.params.id);

    if (service) {
        if (service.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        service.title = title || service.title;
        service.description = description || service.description;
        service.basePrice = basePrice || service.basePrice;
        service.deliveryTime = deliveryTime || service.deliveryTime;

        if (req.file) {
            service.coverImage = req.file.path;
        }

        const updatedService = await service.save();
        res.json(updatedService);
    } else {
        res.status(404);
        throw new Error('Service not found');
    }
});

// @desc    Toggle service status
// @route   PATCH /api/vendor/services/:id/toggle
// @access  Private/Vendor
const toggleServiceStatus = asyncHandler(async (req, res) => {
    const service = await Service.findById(req.params.id);

    if (service) {
        if (service.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        service.isActive = !service.isActive;
        await service.save();
        res.json({ message: `Service ${service.isActive ? 'enabled' : 'disabled'}`, isActive: service.isActive });
    } else {
        res.status(404);
        throw new Error('Service not found');
    }
});

// @desc    Get public services by vendor
// @route   GET /api/users/artist/:id/services
// @access  Public
const getServicesByVendor = asyncHandler(async (req, res) => {
    const services = await Service.find({
        vendor: req.params.id,
        isActive: true
    }).sort('-createdAt');
    res.json(services);
});

// @desc    Get all public services
// @route   GET /api/services
// @access  Public
const getAllPublicServices = asyncHandler(async (req, res) => {
    const services = await Service.find({ isActive: true })
        .populate('vendor', 'name vendorProfile')
        .sort('-createdAt');
    res.json(services);
});

module.exports = {
    getVendorServices,
    getServiceById,
    createService,
    updateService,
    toggleServiceStatus,
    getServicesByVendor,
    getAllPublicServices
};
