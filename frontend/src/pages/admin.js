import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [borrowed, setBorrowed] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "", category: "", description: "", image_url: "", file_url: "", quantity: 1 });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "" });
  const [editingBook, setEditingBook] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // Changé pour afficher dashboard par défaut
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const { token, user } = useAuth();

  // ================= FETCH =================

  const fetchUsers = () => {
    fetch("http://localhost:3001/admin/users", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchBooks = () => {
    fetch("http://localhost:3001/admin/books", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBooks(Array.isArray(data) ? data : []))
      .catch(console.error);
  };

  const fetchBorrowed = () => {
    fetch("http://localhost:3001/admin/borrowed", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setBorrowed(Array.isArray(data) ? data : []))
      .catch(err => setBorrowed([]));
  };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch("http://localhost:3001/admin/stats", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchBooks();
      fetchBorrowed();
      fetchStats();
    }
  }, [token]);

  // ================= DELETE =================

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      await fetch(`http://localhost:3001/admin/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchUsers();
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      await fetch(`http://localhost:3001/admin/books/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      fetchBooks();
    }
  };

  // ================= ADD =================

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch("http://localhost:3001/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newUser)
    });

    if (res.ok) {
      alert("User added ✅");
      fetchUsers();
      setNewUser({ name: "", email: "", password: "", role: "" });
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) {
      alert("Fill title and author");
      return;
    }

    const res = await fetch("http://localhost:3001/admin/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(newBook)
    });

    if (res.ok) {
      alert("Book added ✅");
      fetchBooks();
      setNewBook({ title: "", author: "", category: "", description: "", image_url: "", file_url: "", quantity: 1 });
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // ================= EDIT BOOK =================

  const handleEditBook = (book) => {
    setEditingBook(book);
  };

  const handleUpdateBook = async () => {
    const res = await fetch(`http://localhost:3001/admin/books/${editingBook.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(editingBook)
    });

    if (res.ok) {
      alert("Book updated ✅");
      fetchBooks();
      setEditingBook(null);
    } else {
      const data = await res.json();
      alert(data.error);
    }
  };

  // ================= EXPORT =================

  const exportToCSV = (data, filename) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map(row => headers.map(header => JSON.stringify(row[header] || "")).join(","))
    ];
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportBooksToCSV = () => exportToCSV(books, "books_export");
  const exportBorrowedToCSV = () => exportToCSV(borrowed, "borrowed_books_export");
  const exportUsersToCSV = () => exportToCSV(users, "users_export");

  // ================= SEARCH =================
  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user || user.role !== "admin") {
    return <div className="admin-page"><h2>Access denied ❌ (Admin only)</h2></div>;
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {/* TABS avec Dashboard */}
      <div className="admin-tabs">
        <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>
          Dashboard 📊
        </button>
        <button className={activeTab === "users" ? "active" : ""} onClick={() => setActiveTab("users")}>
          Users ({users.length})
        </button>
        <button className={activeTab === "books" ? "active" : ""} onClick={() => setActiveTab("books")}>
          Books ({books.length})
        </button>
        <button className={activeTab === "borrowed" ? "active" : ""} onClick={() => setActiveTab("borrowed")}>
          Borrowed ({borrowed.length})
        </button>
      </div>

      {/* ================= DASHBOARD SECTION ================= */}
      {activeTab === "dashboard" && (
        <div className="admin-section">
          <h2>Statistics Dashboard</h2>
          {loadingStats && <p>Loading...</p>}
          {stats && (
            <>
              <div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "15px", marginBottom: "30px"}}>
                <div style={{background: "#e3f2fd", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                  <h3>📚 Total Books</h3>
                  <p style={{fontSize: "24px", fontWeight: "bold"}}>{stats.totalBooks}</p>
                </div>
                <div style={{background: "#e8f5e9", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                  <h3>👥 Total Users</h3>
                  <p style={{fontSize: "24px", fontWeight: "bold"}}>{stats.totalUsers}</p>
                </div>
                <div style={{background: "#fff3e0", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                  <h3>📖 Total Borrows</h3>
                  <p style={{fontSize: "24px", fontWeight: "bold"}}>{stats.totalBorrows}</p>
                </div>
                <div style={{background: "#c8e6c9", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                  <h3>🟢 Active Borrows</h3>
                  <p style={{fontSize: "24px", fontWeight: "bold"}}>{stats.activeBorrows}</p>
                </div>
                <div style={{background: "#ffcdd2", padding: "20px", borderRadius: "10px", textAlign: "center"}}>
                  <h3>⚠️ Overdue</h3>
                  <p style={{fontSize: "24px", fontWeight: "bold"}}>{stats.overdueBorrows}</p>
                </div>
              </div>
              <h3>Top 5 Popular Books</h3>
              <ul style={{listStyle: "none", padding: 0}}>
                {stats.popularBooks?.map(book => (
                  <li key={book.id} style={{background: "#f5f5f5", margin: "10px 0", padding: "10px", borderRadius: "5px"}}>
                    {book.title} - {book.borrow_count} borrows
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* ================= USERS SECTION (identique à votre code) ================= */}
      {activeTab === "users" && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Users Management</h2>
            <button onClick={exportUsersToCSV} className="export-btn">📥 Export Users to CSV</button>
          </div>
          <div className="add-form">
            <h3>Add New User</h3>
            <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
            <input placeholder="Email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
            <input type="password" placeholder="Password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
              <option value="">Select role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddUser}>Add User</button>
          </div>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                  <td><button className="delete-btn" onClick={() => handleDeleteUser(u.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= BOOKS SECTION (avec édition complète) ================= */}
      {activeTab === "books" && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Books Management</h2>
            <button onClick={exportBooksToCSV} className="export-btn">📥 Export Books to CSV</button>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="add-form">
            <h3>Add New Book</h3>
            <input placeholder="Title *" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} />
            <input placeholder="Author *" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} />
            <input placeholder="Category" value={newBook.category} onChange={e => setNewBook({...newBook, category: e.target.value})} />
            <input placeholder="Image URL" value={newBook.image_url} onChange={e => setNewBook({...newBook, image_url: e.target.value})} />
            <input placeholder="PDF URL" value={newBook.file_url} onChange={e => setNewBook({...newBook, file_url: e.target.value})} />
            <input placeholder="Quantity" type="number" value={newBook.quantity} onChange={e => setNewBook({...newBook, quantity: parseInt(e.target.value)})} />
            <textarea placeholder="Description" rows="3" value={newBook.description} onChange={e => setNewBook({...newBook, description: e.target.value})} />
            <button onClick={handleAddBook}>Add Book</button>
          </div>

          {/* Modal d'édition complet */}
          {editingBook && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Book</h3>
                <input placeholder="Title" value={editingBook.title} onChange={e => setEditingBook({...editingBook, title: e.target.value})} />
                <input placeholder="Author" value={editingBook.author} onChange={e => setEditingBook({...editingBook, author: e.target.value})} />
                <input placeholder="Category" value={editingBook.category || ""} onChange={e => setEditingBook({...editingBook, category: e.target.value})} />
                <input placeholder="Image URL" value={editingBook.image_url || ""} onChange={e => setEditingBook({...editingBook, image_url: e.target.value})} />
                <input placeholder="PDF URL" value={editingBook.file_url || ""} onChange={e => setEditingBook({...editingBook, file_url: e.target.value})} />
                <input placeholder="Quantity" type="number" value={editingBook.quantity} onChange={e => setEditingBook({...editingBook, quantity: parseInt(e.target.value)})} />
                <textarea placeholder="Description" rows="3" value={editingBook.description || ""} onChange={e => setEditingBook({...editingBook, description: e.target.value})} />
                <div className="modal-buttons">
                  <button onClick={handleUpdateBook}>Save Changes</button>
                  <button onClick={() => setEditingBook(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <table>
            <thead><tr><th>Image</th><th>Title</th><th>Author</th><th>Category</th><th>Quantity</th><th>Description</th><th>PDF</th><th>Action</th></tr></thead>
            <tbody>
              {filteredBooks.map(b => (
                <tr key={b.id}>
                  <td>{b.image_url ? <img src={`http://localhost:3001/uploads/${b.image_url}`} alt={b.title} className="book-thumbnail" /> : "No image"}</td>
                  <td>{b.title}</td><td>{b.author}</td><td>{b.category || "-"}</td><td>{b.quantity || 0}</td>
                  <td className="description-cell">{b.description ? b.description.substring(0,100)+"..." : "-"}</td>
                  <td>{b.file_url ? <a href={b.file_url} target="_blank" rel="noreferrer">View PDF</a> : "No PDF"}</td>
                  <td><button className="edit-btn" onClick={() => handleEditBook(b)}>Edit</button><button className="delete-btn" onClick={() => handleDeleteBook(b.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= BORROWED SECTION ================= */}
      {activeTab === "borrowed" && (
        <div className="admin-section">
          <div className="section-header">
            <h2>Borrowed Books</h2>
            <button onClick={exportBorrowedToCSV} className="export-btn">📥 Export Borrowed Books to CSV</button>
          </div>
          {borrowed.length === 0 ? <p>No borrowed books found</p> : (
            <table>
              <thead><tr><th>User Name</th><th>User Email</th><th>Book Title</th><th>Book Author</th><th>Category</th><th>Description</th><th>Borrow Date</th><th>Return Date</th><th>Status</th></tr></thead>
              <tbody>
                {borrowed.map((b, idx) => (
                  <tr key={b.id || idx}>
                    <td>{b.user_name}</td><td>{b.user_email}</td><td>{b.book_title}</td><td>{b.book_author}</td>
                    <td>{b.book_category || "-"}</td>
                    <td className="description-cell">{b.book_description ? b.book_description.substring(0,100)+"..." : "-"}</td>
                    <td>{b.borrow_date ? new Date(b.borrow_date).toLocaleDateString() : "-"}</td>
                    <td>{b.return_date ? new Date(b.return_date).toLocaleDateString() : "Not returned"}</td>
                    <td><span className={`status-${b.status || "borrowed"}`}>{b.status || "Borrowed"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export default Admin;