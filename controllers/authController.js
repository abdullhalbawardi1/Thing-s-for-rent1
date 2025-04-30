const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler"); // Simple middleware for handling exceptions inside of async express routes and passing them to your express error handlers.

// Utility function to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Example: token expires in 30 days
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, phoneNumber, profilePicture } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Create new user
    const user = await User.create({
        name,
        email,
        password, // Password will be hashed by the pre-save hook in User model
        phoneNumber,
        profilePicture
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
            token: generateToken(user._id),
        });
    } else {
        res.status(401); // Unauthorized
        throw new Error("Invalid email or password");
    }
});

// @desc    Get user profile (Example of a protected route)
// @route   GET /api/users/profile 
// @access  Private (Requires token)
// We will implement the route and middleware later
const getUserProfile = asyncHandler(async (req, res) => {
    // req.user will be set by the auth middleware
    const user = await User.findById(req.user._id).select("-password"); // Exclude password

    if (user) {
        res.json({
             _id: user._id,
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            profilePicture: user.profilePicture,
        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});


module.exports = { registerUser, loginUser, getUserProfile };
