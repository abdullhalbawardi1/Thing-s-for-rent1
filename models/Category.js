const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    // Add other fields if needed, e.g., icon URL
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
