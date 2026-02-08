const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user);
});

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (name) user.name = name;
    await user.save();

    const updated = await User.findById(user._id).select('-password');
    res.json(updated);
});

// @desc    Get current user addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('addresses');
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }
    res.json(user.addresses || []);
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const { label, street, city, state, pincode, phone, isDefault } = req.body;

    if (!street || !city || !phone) {
        res.status(400);
        throw new Error('Street, city and phone are required');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const newAddress = {
        label: label || 'Home',
        street,
        city,
        state: state || '',
        pincode: pincode || '',
        phone,
        isDefault: !!isDefault
    };

    if (isDefault && user.addresses?.length) {
        user.addresses.forEach(addr => { addr.isDefault = false; });
    }

    user.addresses = user.addresses || [];
    user.addresses.push(newAddress);
    await user.save();

    const added = user.addresses[user.addresses.length - 1];
    res.status(201).json(added);
});

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const { label, street, city, state, pincode, phone, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const address = user.addresses?.id(req.params.id);
    if (!address) {
        res.status(404);
        throw new Error('Address not found');
    }

    if (label !== undefined) address.label = label;
    if (street !== undefined) address.street = street;
    if (city !== undefined) address.city = city;
    if (state !== undefined) address.state = state;
    if (pincode !== undefined) address.pincode = pincode;
    if (phone !== undefined) address.phone = phone;
    if (isDefault !== undefined) {
        if (isDefault) {
            user.addresses.forEach(addr => { addr.isDefault = false; });
        }
        address.isDefault = !!isDefault;
    }

    await user.save();
    res.json(address);
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const address = user.addresses?.id(req.params.id);
    if (!address) {
        res.status(404);
        throw new Error('Address not found');
    }

    user.addresses.pull(req.params.id);
    await user.save();
    res.json({ message: 'Address removed' });
});

module.exports = {
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
};
