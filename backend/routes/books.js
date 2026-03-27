const express = require("express");
const db = require("../database/db");

const router = express.Router();


// ================= GET ALL BOOKS =================
router.get("/", async (req, res) => {
  const { search, category } = req.query;

  try {
    let query = "SELECT * FROM books WHERE 1=1";
    let params = [];

    if (search) {
      query += " AND title LIKE ?";
      params.push(`%${search}%`);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    const [books] = await db.query(query, params);
    res.json(books);

  } catch (err) {
    console.error("GET BOOKS ERROR:", err);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});
// ================= GET AVAILABILITY =================
router.get("/availability/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT MIN(return_date) AS next_available
       FROM borrow
       WHERE book_id = ?`,
      [req.params.id]
    );

    res.json(rows[0]);

  } catch (err) {
    console.error("AVAILABILITY ERROR:", err);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// ================= GET ONE BOOK =================
// GET ONE BOOK
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, title, author, category, description, file_url, image_url FROM books WHERE id = ?",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(rows[0]); // this ensures image_url is always included
  } catch (err) {
    console.error("GET BOOK ERROR:", err);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

module.exports = router;