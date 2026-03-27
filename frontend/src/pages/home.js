import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./home.css";

function Home() {
  const [books, setBooks] = useState([]);
  const [user, setUser] = useState(null); // logged-in user
  const [showMenu, setShowMenu] = useState(false); // toggle profile dropdown
  const navigate = useNavigate();

  // Check logged-in user on mount
  useEffect(() => {
    const loggedUser = JSON.parse(localStorage.getItem("user"));
    if (loggedUser) setUser(loggedUser);
  }, []);

  // Fetch books from backend
  useEffect(() => {
    fetch("http://localhost:3001/books")
      .then((res) => res.json())
      .then((data) => setBooks(data))
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  // Toggle dropdown menu
  const handleToggleMenu = () => {
    setShowMenu((prev) => !prev);
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setShowMenu(false);
    navigate("/login");
  };

  const handleClickBook = (book) => {
    alert(`You clicked "${book.title}"`);
  };

  return (
    <div className="home">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="logo">📚 Home Library</h1>
        <div className="links">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>

          {user ? (
            <>
              <Link to="/borrow">My Books</Link>
              <div className="profile-container">
                <div className="profile-circle" title={user.name} onClick={handleToggleMenu}>
                  <img src="/anonymous.png" alt="profile" />
                  {/* Optional badge: number of borrowed books */}
                  {user.borrowedBooks?.length > 0 && (
                    <span className="book-badge">{user.borrowedBooks.length}</span>
                  )}
                </div>

                {showMenu && (
                  <div className="profile-menu">
                    <p>{user.name}</p>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/sign_up">Sign Up</Link>
              <Link to="/login" className="signin-btn">Sign In</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <h2>Welcome to Your Library</h2>
        <p>Manage books and borrowing easily</p>
        <button className="explore-btn" onClick={() => navigate("/books")}>
          Explore Books
        </button>
      </div>

      {/* Books Section */}
      <div className="books">
        <h2>Popular Books</h2>
        <div className="book-list">
          {books.length === 0 ? (
            <p>Loading books...</p>
          ) : (
            books.map((book) => (
              <div
                key={book.id}
                className="book-card"
                onClick={() => handleClickBook(book)}
              >
                <h3>{book.title}</h3>
                <p>Author: {book.author}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;