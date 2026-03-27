const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcrypt");
const { verifyToken, checkAdmin } = require("./auth");

const router = express.Router();


// ================= USERS =================

// Get all users
router.get("/users", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, role FROM users"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add user (WITH HASHING ✅)
router.post("/users", verifyToken, checkAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "Password must contain 1 uppercase and 1 number" });
    }

    // check email exists
    const [existing] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // 🔥 HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // insert user
    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    res.json({ message: "User added successfully ✅ (password hashed)" });

  } catch (err) {
    console.error("ADD USER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});


// Delete user
router.delete("/users/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    await db.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ================= BOOKS =================

// Get all books
router.get("/books", async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Add book
router.post("/books", verifyToken, checkAdmin, async (req, res) => {
  const { title, author } = req.body;

  try {
    if (!title || !author) {
      return res.status(400).json({ error: "All fields required" });
    }

    await db.query(
      "INSERT INTO books (title, author, quantity) VALUES (?, ?, 1)",
      [title, author]
    );

    res.json({ message: "Book added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Delete book
router.delete("/books/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const bookId = req.params.id;

    await db.query("DELETE FROM books WHERE id = ?", [bookId]);

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;