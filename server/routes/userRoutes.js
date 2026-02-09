const express = require('express');
const router = express.Router();
const { getArtistProfile } = require('../controllers/vendorProfileController');
const { getProductById, getProductsByVendor } = require('../controllers/productController');
const { getServicesByVendor } = require('../controllers/serviceController');
const {
    getProfile,
    updateProfile,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/userController');
const { runValidation } = require('../middleware/validate.middleware');
const { updateProfileRules, addAddressRules, updateAddressRules } = require('../validators/user.validator');

// Public Artist Profile
router.get('/artists', require('../controllers/vendorProfileController').getAllArtists);
router.get('/artist/:id', getArtistProfile);
router.get('/artist/:id/products', getProductsByVendor);
router.get('/artist/:id/services', getServicesByVendor);

// Public Product Details (Generic)
router.get('/products/:id', getProductById);

// Protected routes
const { protect } = require('../middleware/auth.middleware');
const { getUserDashboardStats } = require('../controllers/userDashboardController');

router.get('/dashboard', protect, getUserDashboardStats);

// Profile
router.route('/profile').get(protect, getProfile).put(protect, runValidation(updateProfileRules()), updateProfile);

// Addresses
router.route('/addresses')
    .get(protect, getAddresses)
    .post(protect, runValidation(addAddressRules()), addAddress);
router.route('/addresses/:id')
    .put(protect, runValidation(updateAddressRules()), updateAddress)
    .delete(protect, deleteAddress);

module.exports = router;
