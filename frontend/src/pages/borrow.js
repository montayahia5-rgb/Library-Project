import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "./borrow.css";

function MyBooks() {
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const { user, token } = useAuth();

  const fetchBorrowedBooks = async () => {
    if (!user || !token) return;

    try {
      const res = await fetch("http://localhost:3001/borrow/my-books", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        setBorrowedBooks(data);
      } else {
        console.error("Error:", data.error);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBorrowedBooks();
  }, [user, token]);

  const handleReturn = async (borrowId) => {
    try {
      const res = await fetch(`http://localhost:3001/borrow/${borrowId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (res.ok) {
        fetchBorrowedBooks(); // refresh list
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Return error:", err);
    }
  };

  if (!user) {
    return (
      <div className="books-page">
        <h2>Please log in to view your borrowed books</h2>
      </div>
    );
  }

  return (
    <div className="books-page">
      <h2>My Borrowed Books</h2>

      {borrowedBooks.length === 0 ? (
        <p>No books borrowed.</p>
      ) : (
        <div className="book-list">
          {borrowedBooks.map(b => (
            <div key={b.id} className={`book-card ${b.is_overdue ? "overdue" : ""}`}>
              {b.is_overdue && <div className="alert-badge">⚠️ En retard</div>}
              <h3>{b.title}</h3>
              <p>Author: {b.author}</p>
              <p>
                Return by:{" "}
                {new Date(b.return_date).toLocaleDateString()}
              </p>
              <p>
                Borrowed on:{" "}
                {new Date(b.borrow_date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyBooks;