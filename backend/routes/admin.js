const express = require("express");
const db = require("../database/db");
const bcrypt = require("bcrypt");
const { verifyToken, checkAdmin } = require("./auth");

const router = express.Router();

// ================= USERS =================
router.get("/users", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, role FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users", verifyToken, checkAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])/;
    if (!passwordRegex.test(password)) return res.status(400).json({ error: "Password must contain 1 uppercase and 1 number" });
    const [existing] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ error: "Email already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, role || "user"]);
    res.json({ message: "User added successfully ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.delete("/users/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BORROWED =================
router.get("/borrowed", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [borrowed] = await db.query(`
      SELECT borrow.id, users.id AS user_id, users.name AS user_name, users.email AS user_email,
             books.id AS book_id, books.title AS book_title, books.author AS book_author,
             books.category AS book_category, books.description AS book_description,
             borrow.borrow_date, borrow.return_date, borrow.status
      FROM borrow
      JOIN users ON borrow.user_id = users.id
      JOIN books ON borrow.book_id = books.id
      ORDER BY borrow.borrow_date DESC
    `);
    res.json(borrowed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= BOOKS =================
router.get("/books", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/books/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books WHERE id = ?", [req.params.id]);
    if (books.length === 0) return res.status(404).json({ error: "Book not found" });
    res.json(books[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/books", verifyToken, checkAdmin, async (req, res) => {
  const { title, author, category, description, image_url, file_url, quantity } = req.body;
  try {
    if (!title || !author) return res.status(400).json({ error: "Title and author are required" });
    await db.query(
      "INSERT INTO books (title, author, category, description, image_url, file_url, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, author, category || null, description || null, image_url || null, file_url || null, quantity || 1]
    );
    res.json({ message: "Book added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/books/:id", verifyToken, checkAdmin, async (req, res) => {
  const { title, author, category, description, image_url, file_url, quantity } = req.body;
  const bookId = req.params.id;
  try {
    await db.query(
      `UPDATE books SET title=?, author=?, category=?, description=?, image_url=?, file_url=?, quantity=? WHERE id=?`,
      [title, author, category, description, image_url, file_url, quantity, bookId]
    );
    res.json({ message: "Book updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/books/:id", verifyToken, checkAdmin, async (req, res) => {
  try {
    await db.query("DELETE FROM books WHERE id = ?", [req.params.id]);
    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= STATISTIQUES =================
router.get("/stats", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [totalBooks] = await db.query("SELECT COUNT(*) as count FROM books");
    const [totalUsers] = await db.query("SELECT COUNT(*) as count FROM users");
    const [totalBorrows] = await db.query("SELECT COUNT(*) as count FROM borrow");
    const [activeBorrows] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE return_date >= CURDATE()");
    const [overdueBorrows] = await db.query("SELECT COUNT(*) as count FROM borrow WHERE return_date < CURDATE()");
    const [popularBooks] = await db.query(`
      SELECT books.id, books.title, COUNT(*) as borrow_count
      FROM borrow JOIN books ON borrow.book_id = books.id
      GROUP BY books.id ORDER BY borrow_count DESC LIMIT 5
    `);
    res.json({
      totalBooks: totalBooks[0].count,
      totalUsers: totalUsers[0].count,
      totalBorrows: totalBorrows[0].count,
      activeBorrows: activeBorrows[0].count,
      overdueBorrows: overdueBorrows[0].count,
      popularBooks
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ================= EXPORTS =================
router.get("/export/books", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [books] = await db.query("SELECT * FROM books");
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/export/borrowed", verifyToken, checkAdmin, async (req, res) => {
  try {
    const [borrowed] = await db.query(`
      SELECT users.name AS user_name, users.email AS user_email,
             books.title AS book_title, books.author AS book_author,
             borrow.borrow_date, borrow.return_date
      FROM borrow
      JOIN users ON borrow.user_id = users.id
      JOIN books ON borrow.book_id = books.id
    `);
    res.json(borrowed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;