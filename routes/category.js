const express = require("express");
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const { protect } = require("../middleware/authMiddleware"); // Assuming admin/protected access needed

const router = express.Router();

// Public routes
router.route("/").get(getCategories);
router.route("/:id").get(getCategoryById);

// Private/Admin routes (Protected for now, can add admin check later)
router.route("/").post(protect, createCategory);
router.route("/:id").put(protect, updateCategory);
router.route("/:id").delete(protect, deleteCategory);

module.exports = router;
