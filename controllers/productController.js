const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category"); // Needed for category filtering/validation

// @desc    Fetch all products (with optional filtering/pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // Basic filtering (can be expanded)
    const query = {};
    if (req.query.category) {
        // Find category ID by name first if needed, or expect ID directly
        // For simplicity, assuming category ID is passed directly for now
        query.category = req.query.category;
    }
    if (req.query.search) {
        query.name = { $regex: req.query.search, $options: "i" }; // Case-insensitive search by name
    }
    // Add location and price filtering if needed

    // Basic pagination (can be improved)
    const pageSize = 10; // Number of products per page
    const page = Number(req.query.pageNumber) || 1;

    const count = await Product.countDocuments(query);
    const products = await Product.find(query)
        .populate("category", "name") // Populate category name
        .populate("owner", "name email") // Populate owner name/email, exclude sensitive data
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ products, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
                                .populate("category", "name")
                                .populate("owner", "name email profilePicture"); // Populate owner details

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error("Product not found");
    }
});

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Requires login)
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, images, location } = req.body;

    // Basic validation (can be enhanced)
    if (!name || !description || !price || !category) {
        res.status(400);
        throw new Error("Please provide name, description, price, and category");
    }

    // Check if category exists (optional but good practice)
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
        res.status(400);
        throw new Error("Invalid category ID");
    }

    const product = new Product({
        name,
        description,
        price,
        category,
        owner: req.user._id, // Get owner from authenticated user
        images: images || [], // Handle optional images
        location,
        isAvailable: true, // Default to available
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Requires login and ownership)
const updateProduct = asyncHandler(async (req, res) => {
    const { name, description, price, category, images, location, isAvailable } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if the logged-in user owns the product
    if (product.owner.toString() !== req.user._id.toString()) {
        res.status(401); // Unauthorized
        throw new Error("User not authorized to update this product");
    }

    // Update fields if provided
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.category = category || product.category;
    product.images = images !== undefined ? images : product.images;
    product.location = location !== undefined ? location : product.location;
    product.isAvailable = isAvailable !== undefined ? isAvailable : product.isAvailable;

    // Check if category exists if it's being updated
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            res.status(400);
            throw new Error("Invalid category ID");
        }
    }

    const updatedProduct = await product.save();
    res.json(updatedProduct);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Requires login and ownership)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // Check if the logged-in user owns the product
    if (product.owner.toString() !== req.user._id.toString()) {
        res.status(401); // Unauthorized
        throw new Error("User not authorized to delete this product");
    }

    // Consider implications: what happens to bookings associated with this product?
    // For now, just delete the product.
    await product.deleteOne(); // Use deleteOne() or remove() depending on Mongoose version

    res.json({ message: "Product removed" });
});


module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
};
