const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const { cloudinary } = require('../config/cloudinary');
const mongoose = require('mongoose');
const Category = require('../models/Category');

// @desc    Get all products for a vendor
// @route   GET /api/products/vendor
// @access  Private/Vendor
const getVendorProducts = asyncHandler(async (req, res) => {
    // Only get products matching the vendor's ID
    const products = await Product.find({ vendor: req.user.id }).sort('-createdAt');
    res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public (or Private for vendor edit)
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (product) {
        // If inactive, only allow vendor to view
        if (!product.isActive) {
            if (!req.user || product.vendor.toString() !== req.user.id) {
                res.status(404);
                throw new Error('Product not found');
            }
        }
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Vendor
const createProduct = asyncHandler(async (req, res) => {
    const {
        title, description, price, category, subCategory, type, stock,
        style, gender, availableSizes, availableColors, printLocations,
        material, designType, downloadUrl
    } = req.body;

    let images = [];
    if (req.files) {
        req.files.map(file => {
            images.push(file.path);
        });
    }

    const product = new Product({
        vendor: req.user.id,
        title,
        description,
        price,
        category,
        subCategory,
        type,
        style,
        gender,
        availableSizes,
        availableColors,
        printLocations,
        material,
        designType,
        images,
        downloadUrl: type === 'digital' ? downloadUrl : undefined,
        stock: type === 'physical' ? stock : 0,
        status: 'active',
        isActive: true
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Vendor
const updateProduct = asyncHandler(async (req, res) => {
    const {
        title, description, price, category, subCategory, type, stock, status, isActive,
        style, gender, availableSizes, availableColors, printLocations, material, designType, downloadUrl
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        product.title = title || product.title;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.subCategory = subCategory || product.subCategory;
        product.type = type || product.type;
        product.stock = stock || product.stock;
        product.status = status || product.status;

        // Updates for merchandise fields
        if (style) product.style = style;
        if (gender) product.gender = gender;
        if (availableSizes) product.availableSizes = availableSizes;
        if (availableColors) product.availableColors = availableColors;
        if (printLocations) product.printLocations = printLocations;
        if (material) product.material = material;
        if (designType) product.designType = designType;
        if (product.type === 'digital' && downloadUrl !== undefined) product.downloadUrl = downloadUrl;

        if (isActive !== undefined) {
            product.isActive = isActive;
        }

        if (req.body.existingImages) {
            product.images = Array.isArray(req.body.existingImages) ? req.body.existingImages : [req.body.existingImages];
        }

        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            product.images = [...product.images, ...newImages];
        }

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Toggle product status
// @route   PATCH /api/products/:id/toggle
// @access  Private/Vendor
const toggleProductStatus = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        product.isActive = !product.isActive;
        await product.save();
        res.json({ message: `Product ${product.isActive ? 'enabled' : 'disabled'}`, isActive: product.isActive });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Vendor
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        if (product.vendor.toString() !== req.user.id) {
            res.status(401);
            throw new Error('Not authorized');
        }

        // Optional: delete images from cloudinary
        // product.images.forEach(async (image) => { ... });

        await product.deleteOne();
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get public products by vendor
// @route   GET /api/users/artist/:id/products
// @access  Public
const getProductsByVendor = asyncHandler(async (req, res) => {
    const products = await Product.find({
        vendor: req.params.id,
        isActive: true,
        status: 'active'
    }).sort('-createdAt');
    res.json(products);
});

// @desc    Get all public products
// @route   GET /api/products
// @access  Public
const getAllPublicProducts = asyncHandler(async (req, res) => {
    let query = { isActive: true, status: 'active' };

    if (req.query.category) {
        if (mongoose.Types.ObjectId.isValid(req.query.category)) {
            query.category = req.query.category;
        } else {
            const slug = req.query.category.toLowerCase().trim();
            let categoryDoc = await Category.findOne({ slug });
            // Slug aliases for shop filters (art, merch, digital) → DB slugs (physical-art, merchandise, digital-assets)
            if (!categoryDoc) {
                const slugAliases = {
                    art: 'physical-art',
                    'physical-art': 'physical-art',
                    merch: 'merchandise',
                    merchandise: 'merchandise',
                    digital: 'digital-assets',
                    'digital-assets': 'digital-assets'
                };
                const resolvedSlug = slugAliases[slug] || slug;
                categoryDoc = await Category.findOne({ slug: resolvedSlug });
            }
            if (categoryDoc) {
                query.category = categoryDoc._id;
            } else {
                return res.json([]);
            }
        }
    }

    if (req.query.type) {
        query.type = req.query.type;
    }

    // SubCategory: for T-Shirts, match explicit subCategory OR merchandise apparel (many products use merchandiseType only)
    if (req.query.subCategory) {
        const sub = req.query.subCategory.trim();
        if (sub.toLowerCase() === 't-shirts') {
            query.$or = [
                { subCategory: /t-shirt/i },
                { productType: 'merchandise', merchandiseType: 'apparel' }
            ];
        } else {
            query.subCategory = sub;
        }
    }
    if (req.query.gender) {
        query.gender = req.query.gender;
    }
    // Only filter by style when provided; match value or products with no style set
    if (req.query.style && req.query.style.trim()) {
        const styleVal = req.query.style.trim();
        query.$and = query.$and || [];
        query.$and.push({
            $or: [
                { style: new RegExp('^' + styleVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
                { style: { $in: [null, ''] } },
                { style: { $exists: false } }
            ]
        });
    }
    if (req.query.size) {
        query.availableSizes = req.query.size;
    }
    if (req.query.color) {
        query.availableColors = req.query.color; // Name or Code
    }

    if (req.query.search) {
        query.title = { $regex: req.query.search, $options: 'i' };
    }

    const products = await Product.find(query)
        .populate('vendor', 'name vendorProfile')
        .sort('-createdAt');
    res.json(products);
});

module.exports = {
    getVendorProducts,
    getProductById,
    createProduct,
    updateProduct,
    toggleProductStatus,
    deleteProduct,
    getProductsByVendor,
    getAllPublicProducts
};
