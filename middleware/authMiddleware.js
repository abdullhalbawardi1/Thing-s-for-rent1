const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check for token in Authorization header (Bearer token)
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (excluding password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                res.status(401);
                throw new Error("Not authorized, user not found");
            }

            next(); // Proceed to the next middleware/route handler
        } catch (error) {
            console.error(error);
            res.status(401); // Unauthorized
            throw new Error("Not authorized, token failed");
        }
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token");
    }
});

// Optional: Middleware for admin authorization (if needed later)
const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) { // Assuming you add an isAdmin field to User model
        next();
    } else {
        res.status(401);
        throw new Error("Not authorized as an admin");
    }
};

module.exports = { protect }; // Export only protect for now

