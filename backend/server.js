require("dotenv").config(); // load environment variables

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const db = require("./database/db"); // import MySQL connection
const { router: authRoutes } = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const borrowRoutes = require("./routes/borrow");
const app = express();
const port = process.env.PORT || 3001;
const booksRoutes = require("./routes/books");

// Security middlewares
app.use(helmet());
app.use(cors({ origin: "http://localhost:3000" })); // allow React frontend
app.use(express.json()); // parse JSON requests
app.use("/auth", authRoutes);
app.use("/books", booksRoutes);
app.use("/borrow", borrowRoutes);
app.use("/admin", adminRoutes);
app.use("/uploads", express.static("uploads"));
// Test route
app.get("/", (req, res) => {
  res.send("Backend is running securely!");
});
// Route to get all users
app.get("/users", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM users");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});
// Route to get all borrowed books (JOIN users + books)
app.get("/borrowed", async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT borrow.id, users.name AS user_name, books.title AS book_title, borrow.borrow_date, borrow.return_date
      FROM borrow
      JOIN users ON borrow.user_id = users.id
      JOIN books ON borrow.book_id = books.id
    `);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch borrowed books" });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});