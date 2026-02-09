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
    getUsers,
    getDownloadAccessList,
    revokeDownloadAccess
} = require('../controllers/adminController');
const {
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { runValidation } = require('../middleware/validate.middleware');
const { createCategoryRules, updateCategoryRules } = require('../validators/category.validator');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/categories', getAdminCategories);
router.post('/categories', runValidation(createCategoryRules()), createCategory);
router.put('/categories/:id', runValidation(updateCategoryRules()), updateCategory);
router.delete('/categories/:id', deleteCategory);
router.get('/orders', getOrders);
router.get('/vendors', getVendors);
router.put('/vendors/:id/approve', updateVendorStatus);
router.get('/products', getProducts);
router.patch('/products/:id', updateProduct);
router.get('/services', getServices);
router.patch('/services/:id', updateService);
router.get('/commissions', getCommissions);
router.get('/users', getUsers);
router.get('/download-access', getDownloadAccessList);
router.put('/download-access/:id/revoke', revokeDownloadAccess);

module.exports = router;
