const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/orders', getOrders);
router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', updateVendorStatus);
router.get('/products', getProducts);
router.patch('/products/:id', updateProduct);
router.get('/services', getServices);
router.patch('/services/:id', updateService);
router.get('/commissions', getCommissions);
router.get('/users', getUsers);

module.exports = router;
