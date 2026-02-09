const asyncHandler = require('express-async-handler');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
    let wishlist = await Wishlist.findOne({ user: req.user.id })
        .populate('products');

    if (!wishlist) {
        // Create empty wishlist if not exists
        wishlist = await Wishlist.create({ user: req.user.id, products: [] });
    }

    res.status(200).json(wishlist);
});

// @desc    Toggle product in wishlist (Add/Remove)
// @route   POST /api/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
        wishlist = await Wishlist.create({ user: req.user.id, products: [productId] });
        res.status(201).json({ message: 'Added to wishlist', wishlist });
    } else {
        // Check if product exists in wishlist
        const isExists = wishlist.products.includes(productId);

        if (isExists) {
            // Remove
            wishlist.products = wishlist.products.filter(
                (id) => id.toString() !== productId
            );
            await wishlist.save();
            res.status(200).json({ message: 'Removed from wishlist', wishlist });
        } else {
            // Add
            wishlist.products.push(productId);
            await wishlist.save();
            res.status(200).json({ message: 'Added to wishlist', wishlist });
        }
    }
});

module.exports = {
    getWishlist,
    toggleWishlist
};
