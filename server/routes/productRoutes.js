const express = require('express');
const router = express.Router();
const {
    getVendorProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getAllPublicProducts
} = require('../controllers/productController');
const { protect } = require('../middleware/auth.middleware');
const { authorize } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate.middleware');
const { upload } = require('../config/cloudinary');
const { createProductRules, updateProductRules } = require('../validators/product.validator');

// Public Product Search
router.get('/', getAllPublicProducts);

// Vendor Products (requires vendor/admin)
router.get('/vendor', protect, authorize('vendor', 'admin'), getVendorProducts);

// Create Product (Vendor/Admin only)
router.post('/', protect, authorize('vendor', 'admin'), upload.array('images', 5), createProductRules(), validate, createProduct);

// Product Toggle (Vendor/Admin only)
router.patch('/:id/toggle', protect, authorize('vendor', 'admin'), toggleProductStatus);

// Product CRUD
router.route('/:id')
    .get(getProductById)
    .put(protect, authorize('vendor', 'admin'), upload.array('images', 5), updateProductRules(), validate, updateProduct)
    .delete(protect, authorize('vendor', 'admin'), deleteProduct);

module.exports = router;
