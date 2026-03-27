const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../database/db");
const router = express.Router();

// JWT Secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-this-in-production";

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

// ✅ ADD THIS - Middleware to check if user is admin
const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  
  next();
};

// Registration route
router.post("/sign_up", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (password.length < 8)
      return res.status(400).json({ error: "Password must be at least 8 characters" });

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
    if (!passwordRegex.test(password))
      return res.status(400).json({ error: "Password must contain 1 uppercase letter and 1 number" });

    const [existingUser] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existingUser.length > 0)
      return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, "user"]
    );

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("REGISTER ERROR FULL:", err);
    res.status(500).json({ error: err.message });
  }
});

// Login route - Returns JWT token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ error: "Wrong password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Return user info and token
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: token
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE THIS - Export router and BOTH middleware
module.exports = { router, verifyToken, checkAdmin };