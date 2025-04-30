const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
// We will add getUserProfile route later when we create the user routes and auth middleware

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

module.exports = router;
