import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"; // ✅ IMPORT TOKEN
import "./admin.css";

function Admin() {
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", author: "" });
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "" });

  const { token, user } = useAuth(); // ✅ GET TOKEN

  // ================= FETCH =================

  const fetchUsers = () => {
    fetch("http://localhost:3001/admin/users", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error);
  };

  const fetchBooks = () => {
    fetch("http://localhost:3001/admin/books", {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(setBooks)
      .catch(console.error);
  };

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchBooks();
    }
  }, [token]);

  // ================= DELETE =================

  const handleDeleteUser = async (id) => {
    await fetch(`http://localhost:3001/admin/users/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    fetchUsers();
  };

  const handleDeleteBook = async (id) => {
    await fetch(`http://localhost:3001/admin/books/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    fetchBooks();
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
        "Authorization": `Bearer ${token}` // ✅ FIXED
      },
      body: JSON.stringify(newUser)
    });

    const data = await res.json();

    if (res.ok) {
      alert("User added ✅");
      fetchUsers();
      setNewUser({ name: "", email: "", password: "", role: "" });
    } else {
      alert(data.error);
    }
  };

  const handleAddBook = async () => {
    if (!newBook.title || !newBook.author) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch("http://localhost:3001/admin/books", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` // ✅ FIXED
      },
      body: JSON.stringify(newBook)
    });

    const data = await res.json();

    if (res.ok) {
      alert("Book added ✅");
      fetchBooks();
      setNewBook({ title: "", author: "" });
    } else {
      alert(data.error);
    }
  };

  // ================= UI PROTECTION =================

  if (!user || user.role !== "admin") {
    return (
      <div className="admin-page">
        <h2>Access denied ❌ (Admin only)</h2>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>

      {/* USERS */}
      <div className="admin-section">
        <h2>Users</h2>

        <input
          placeholder="Name"
          value={newUser.name}
          onChange={e => setNewUser({ ...newUser, name: e.target.value })}
        />

        <input
          placeholder="Email"
          value={newUser.email}
          onChange={e => setNewUser({ ...newUser, email: e.target.value })}
        />

        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={e => setNewUser({ ...newUser, password: e.target.value })}
        />

        <select
          value={newUser.role}
          onChange={e => setNewUser({ ...newUser, role: e.target.value })}
        >
          <option value="">Select role</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={handleAddUser}>Add User</button>

        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="4">No users found</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <button onClick={() => handleDeleteUser(u.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* BOOKS */}
      <div className="admin-section">
        <h2>Books</h2>

        <input
          placeholder="Title"
          value={newBook.title}
          onChange={e => setNewBook({ ...newBook, title: e.target.value })}
        />

        <input
          placeholder="Author"
          value={newBook.author}
          onChange={e => setNewBook({ ...newBook, author: e.target.value })}
        />

        <button onClick={handleAddBook}>Add Book</button>

        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr><td colSpan="3">No books found</td></tr>
            ) : (
              books.map(b => (
                <tr key={b.id}>
                  <td>{b.title}</td>
                  <td>{b.author}</td>
                  <td>
                    <button onClick={() => handleDeleteBook(b.id)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Admin;