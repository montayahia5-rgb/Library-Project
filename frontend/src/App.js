import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Books from "./pages/books";
import Sign_up from "./pages/sign_up";
import Admin from "./pages/admin";
import MyBooks from "./pages/borrow";
import BookDetails from "./pages/bookDetails";

function App() {
  return (
    <Router>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/books" element={<Books />} />
        <Route path="/books/:id" element={<BookDetails />} />
        <Route path="/borrow" element={<MyBooks />} /> 
        <Route path="/admin" element={<Admin />} />
        <Route path="/sign_up" element={<Sign_up />} />     
      </Routes>
    </Router>
  );
}

export default App;