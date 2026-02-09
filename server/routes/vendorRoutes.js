const express = require('express');
const router = express.Router();
const {
    getVendorStats,
    getVendorOrders,
    getVendorPayouts
} = require('../controllers/vendorController');
const {
    getVendorServices,
    getServiceById,
    createService,
    updateService,
    toggleServiceStatus
} = require('../controllers/serviceController');
const {
    updateVendorProfile
} = require('../controllers/vendorProfileController');

const { protect } = require('../middleware/auth.middleware');
const { authorize: roleAuthorize } = require('../middleware/role.middleware');
const { runValidation } = require('../middleware/validate.middleware');
const { upload } = require('../config/cloudinary');
const { createServiceRules, updateServiceRules } = require('../validators/service.validator');

router.use(protect);
router.use(roleAuthorize('vendor', 'admin'));

// Existing routes
router.get('/dashboard', getVendorStats);
router.get('/orders', getVendorOrders);
router.get('/payouts', getVendorPayouts);

// Services
router.route('/services')
    .get(getVendorServices)
    .post(upload.single('coverImage'), runValidation(createServiceRules()), createService);

router.route('/services/:id')
    .get(getServiceById)
    .put(upload.single('coverImage'), runValidation(updateServiceRules()), updateService);

router.patch('/services/:id/toggle', toggleServiceStatus);

// Profile
router.put('/profile', upload.single('profileImage'), updateVendorProfile);

module.exports = router;
