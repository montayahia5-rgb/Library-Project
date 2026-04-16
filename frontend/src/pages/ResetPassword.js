import { useParams } from "react-router-dom";
import { useState } from "react";
import "./login.css"; // reuse same style

function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        `http://localhost:3001/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ password })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Password updated ✅");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Server error");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h2>Reset Password</h2>

        <form onSubmit={handleReset}>
          <input
            type="password"
            placeholder="New password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="login-btn" type="submit">
            Reset Password
          </button>
        </form>

        <div className="login-links">
          <a href="/login" className="forgot-link">
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;