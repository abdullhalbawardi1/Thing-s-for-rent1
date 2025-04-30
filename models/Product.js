const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number, // Consider using a specific type for currency if needed
        required: true,
        min: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    images: [
        {
            type: String // Array of URLs to product images
        }
    ],
    location: {
        // Could be a simple string or a more complex GeoJSON object
        type: String, 
        trim: true
        // required: true // Depending on requirements
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    // Add other fields like condition, rental terms, etc.
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update `updatedAt` field before saving
productSchema.pre("save", function(next) {
    this.updatedAt = Date.now();
    next();
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
