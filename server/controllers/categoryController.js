const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');

const makeSlug = (name) => String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'category';

// @desc    Get all categories (public - for forms, filters, shop)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const { type, parent } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (parent !== undefined) query.parent = parent || null;

    const categories = await Category.find(query)
        .sort({ sortOrder: 1, name: 1 })
        .select('name slug type parent description sortOrder')
        .lean();

    res.json(categories);
});

// @desc    Get all categories (admin - including inactive)
// @route   GET /api/admin/categories
// @access  Private/Admin
const getAdminCategories = asyncHandler(async (req, res) => {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const categories = await Category.find(query)
        .sort({ type: 1, sortOrder: 1, name: 1 })
        .lean();

    res.json(categories);
});

// @desc    Create category
// @route   POST /api/admin/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, type, parent, description, sortOrder } = req.body;
    const slug = req.body.slug || makeSlug(name);

    const existing = await Category.findOne({ slug });
    if (existing) {
        res.status(400);
        throw new Error(`Category with slug "${slug}" already exists`);
    }

    const category = await Category.create({
        name,
        slug,
        type,
        parent: parent || null,
        description: description || '',
        sortOrder: sortOrder ?? 0,
        isActive: true
    });

    res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const { name, slug, type, parent, description, sortOrder, isActive } = req.body;

    if (name) category.name = name;
    if (slug !== undefined) category.slug = slug;
    if (type) category.type = type;
    if (parent !== undefined) category.parent = parent || null;
    if (description !== undefined) category.description = description;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    if (name && !slug) category.slug = makeSlug(category.name);

    await category.save();
    res.json(category);
});

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const hasChildren = await Category.exists({ parent: category._id });
    if (hasChildren) {
        res.status(400);
        throw new Error('Cannot delete category with child categories. Delete or reassign children first.');
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted' });
});

module.exports = {
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory
};
