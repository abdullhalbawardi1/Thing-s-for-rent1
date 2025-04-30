const express = require("express");
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} = require("../controllers/productController");
const { protect } = require("../middleware/authMiddleware"); // Middleware to protect routes
const ratingRouter = require("./rating"); // Import rating router

const router = express.Router();

// Re-route into other resource routers
router.use("/:productId/ratings", ratingRouter); // Mount rating router

// Public routes
router.route("/").get(getProducts);
router.route("/:id").get(getProductById);

// Private routes (require authentication)
router.route("/").post(protect, createProduct);
router.route("/:id").put(protect, updateProduct);
router.route("/:id").delete(protect, deleteProduct);

module.exports = router;
