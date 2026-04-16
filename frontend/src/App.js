import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/login";
import Home from "./pages/home";
import Books from "./pages/books";
import Sign_up from "./pages/sign_up";
import Admin from "./pages/admin";
import MyBooks from "./pages/borrow";
import BookDetails from "./pages/bookDetails";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />     
      </Routes>
    </Router>
  );
}

export default App;