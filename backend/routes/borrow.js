const express = require("express");
const db = require("../database/db");
const { verifyToken } = require("./auth");
const router = express.Router();

// Borrow a book
router.post("/", verifyToken, async (req, res) => {
  const { bookId, return_date } = req.body;
  const userId = req.user.id;

  if (!bookId || !return_date) {
    return res.status(400).json({ error: "Missing data" });
  }

  // BACKEND validation: no past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(return_date);
  if (selectedDate < today) {
    return res.status(400).json({ error: "Return date cannot be in the past" });
  }

  try {
    // Prevent borrowing same book twice
    const [existingBorrow] = await db.query(
      "SELECT * FROM borrow WHERE user_id = ? AND book_id = ? AND return_date >= CURDATE()",
      [userId, bookId]
    );

    if (existingBorrow.length > 0) {
      return res.status(400).json({
        error:
          "You are already borrowing this book! Please return it before borrowing again.",
      });
    }

    const [books] = await db.query(
      "SELECT quantity FROM books WHERE id = ?",
      [bookId]
    );

    if (books.length === 0)
      return res.status(404).json({ error: "Book not found" });
    if (books[0].quantity <= 0)
      return res.status(400).json({ error: "No books available" });

    await db.query(
      "INSERT INTO borrow (user_id, book_id, borrow_date, return_date) VALUES (?, ?, NOW(), ?)",
      [userId, bookId, return_date]
    );

    await db.query("UPDATE books SET quantity = quantity - 1 WHERE id = ?", [
      bookId,
    ]);

    res.json({ message: "Book borrowed successfully" });
  } catch (err) {
    console.error("Borrow error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get borrowed books for the authenticated user (including overdue)
router.get("/my-books", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      `SELECT borrow.id, books.title, books.author, borrow.borrow_date, borrow.return_date,
              CASE WHEN borrow.return_date < CURDATE() THEN 1 ELSE 0 END AS is_overdue
       FROM borrow
       JOIN books ON borrow.book_id = books.id
       WHERE borrow.user_id = ?
       ORDER BY is_overdue DESC, borrow.return_date ASC`,
      [userId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Fetch borrow error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Return a borrowed book
router.delete("/:borrowId", verifyToken, async (req, res) => {
  const borrowId = req.params.borrowId;
  const userId = req.user.id;

  try {
    const [rows] = await db.query(
      "SELECT book_id FROM borrow WHERE id = ? AND user_id = ?",
      [borrowId, userId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Borrow not found or doesn't belong to you" });
    }

    const bookId = rows[0].book_id;

    await db.query("DELETE FROM borrow WHERE id = ?", [borrowId]);
    await db.query("UPDATE books SET quantity = quantity + 1 WHERE id = ?", [
      bookId,
    ]);

    res.json({ message: "Book returned successfully" });
  } catch (err) {
    console.error("Return error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;