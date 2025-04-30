const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db"); // We will create this file next
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/product"); // Import product routes
const categoryRoutes = require("./routes/category"); // Import category routes
const bookingRoutes = require("./routes/booking"); // Import booking routes
// Import other routes later (ratings, etc.)
const { notFound, errorHandler } = require("./middleware/errorMiddleware"); // We will create this file next

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Enable CORS for specific origin (Netlify frontend)
const corsOptions = {
  origin: 'https://thing-s-for-rent-fronted.netlify.app',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));

// Middleware for parsing JSON bodies
app.use(express.json());

// Mount Routers
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Use product routes
app.use("/api/categories", categoryRoutes); // Use category routes
app.use("/api/bookings", bookingRoutes); // Use booking routes
// app.use("/api/ratings", ratingRoutes); // Add later

// Basic route for testing
app.get("/", (req, res) => {
    res.send("API is running...");
});

// Error Handling Middleware
app.use(notFound); // Handle 404 errors
app.use(errorHandler); // Handle other errors

const PORT = process.env.PORT || 5000;

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`)
);

