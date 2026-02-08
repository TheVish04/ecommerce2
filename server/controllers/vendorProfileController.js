const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update vendor profile
// @route   PUT /api/vendor/profile
// @access  Private/Vendor
const updateVendorProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.vendorProfile = {
            ...user.vendorProfile,
            ...req.body
        };

        // Handle profile image upload if present
        if (req.file) {
            user.vendorProfile.profileImage = req.file.path;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            vendorProfile: updatedUser.vendorProfile,
            token: req.headers.authorization.split(' ')[1] // Or don't send token
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Get public artist profile
// @route   GET /api/users/artist/:id
// @access  Public
const getArtistProfile = asyncHandler(async (req, res) => {
    // Actually this might go in userController or separate public route
    // But keeping here is fine
    const user = await User.findById(req.params.id).select('-password');
    if (user && user.role === 'vendor') {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('Artist not found');
    }
});

// @desc    Get all public artists
// @route   GET /api/users/artists
// @access  Public
const getAllArtists = asyncHandler(async (req, res) => {
    const artists = await User.find({ role: 'vendor' })
        .select('-password')
        .sort('-createdAt'); // Or any other sorting logic
    res.json(artists);
});

module.exports = {
    updateVendorProfile,
    getArtistProfile,
    getAllArtists
};
