import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./books.css";

function Books() {
  const [books, setBooks] = useState([]);
  const [returnDate, setReturnDate] = useState("");
  const [availability, setAvailability] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const { user, token } = useAuth();
  const navigate = useNavigate();

  // ================= FETCH BOOKS =================
  const fetchBooks = async () => {
    try {
      let url = "http://localhost:3001/books?";
      if (search) url += `search=${search}&`;
      if (category) url += `category=${category}`;

      const res = await fetch(url);
      const data = await res.json();
      setBooks(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [search, category]);

  // ================= FETCH AVAILABILITY =================
  const fetchAvailability = async (bookId) => {
    try {
      const res = await fetch(
        `http://localhost:3001/books/availability/${bookId}`
      );
      const data = await res.json();
      setAvailability((prev) => ({
        ...prev,
        [bookId]: data.next_available,
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    books.forEach((book) => {
      if (book.quantity === 0 && !availability[book.id]) {
        fetchAvailability(book.id);
      }
    });
  }, [books]);

  // ================= BORROW =================
  const handleBorrow = async (e, bookId) => {
    e.stopPropagation();

    if (!user) return alert("You must be logged in!");
    if (!returnDate) return alert("Select return date!");

    // ✅ FRONTEND validation: no past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(returnDate);
    if (selectedDate < today) {
      return alert("Return date cannot be in the past!");
    }

    try {
      const res = await fetch("http://localhost:3001/borrow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId,
          return_date: returnDate,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("Book borrowed successfully!");
        fetchBooks();
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Borrow error:", err);
    }
  };

  // Get today's date in YYYY-MM-DD for min attribute
  const todayString = new Date().toISOString().split("T")[0];

  return (
    <div className="books-page">
      <h2>All Books</h2>

      {/* FILTERS */}
      <div className="filters">
        <input
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Novels">Novels</option>
          <option value="Plays/Films/Drama">Plays/Films/Drama</option>
          <option value="Science-Fiction">Science-Fiction</option>
          <option value="Philosophy & Ethics">Philosophy & Ethics</option>
          <option value="Romance">Romance</option>
          <option value="Language & Communication">Language & Communication</option>
        </select>
      </div>

      {/* DATE */}
      <input
        className="date-input"
        type="date"
        value={returnDate}
        onChange={(e) => setReturnDate(e.target.value)}
        min={todayString} // ✅ disable past dates
      />

      {/* BOOK LIST */}
      <div className="book-list">
        {books.map((book) => (
          <div
            key={book.id}
            className="book-card"
            onClick={() => navigate(`/books/${book.id}`)}
          >
            <h3>{book.title}</h3>
            <p>Author: {book.author}</p>
            {book.category && <p className="category">{book.category}</p>}

            <p
              className={`status ${
                book.quantity > 0 ? "available" : "unavailable"
              }`}
            >
              {book.quantity > 0 ? "Available" : "Not Available"}
            </p>

            {book.quantity === 0 && availability[book.id] && (
              <p className="availability">
                Available on:{" "}
                {new Date(availability[book.id]).toLocaleDateString()}
              </p>
            )}

            {/* BORROW */}
            <button
              className="borrow-btn"
              disabled={book.quantity === 0 || !user}
              onClick={(e) => handleBorrow(e, book.id)}
            >
              {!user
                ? "Login to Borrow"
                : book.quantity > 0
                ? "Borrow"
                : "Not Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Books;