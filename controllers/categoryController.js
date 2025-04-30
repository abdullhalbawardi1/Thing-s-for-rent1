const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

// @desc    Fetch all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

// @desc    Fetch single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error("Category not found");
    }
});

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private (Admin in the future, protected for now)
const createCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const categoryExists = await Category.findOne({ name });

    if (categoryExists) {
        res.status(400);
        throw new Error("Category already exists");
    }

    const category = new Category({
        name,
        description,
    });

    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin in the future, protected for now)
const updateCategory = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    // Check if new name already exists (and is not the current category's name)
    if (name && name !== category.name) {
        const categoryExists = await Category.findOne({ name });
        if (categoryExists) {
            res.status(400);
            throw new Error("Category with this name already exists");
        }
        category.name = name;
    }

    category.description = description !== undefined ? description : category.description;

    const updatedCategory = await category.save();
    res.json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin in the future, protected for now)
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    // Consider implications: What happens to products using this category?
    // Option 1: Prevent deletion if products exist
    // Option 2: Set products' category to null/default
    // Option 3: Delete products (dangerous)
    // For now, just delete the category.
    await category.deleteOne();

    res.json({ message: "Category removed" });
});

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};
