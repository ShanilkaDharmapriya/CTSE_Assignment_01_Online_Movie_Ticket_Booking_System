import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { registerRequest } from "../services/api.js";

/**
 * Customer registration — creates account via POST /auth/register.
 * No auto-login; user signs in on the login page next.
 */
export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await registerRequest(name.trim(), email.trim(), password);
      if (!res?.success || !res?.data?.user) {
        setError("Unexpected response from server.");
        return;
      }
      // Send user to login with a flag so we can show a success message
      navigate("/login", {
        replace: true,
        state: {
          registered: true,
          registeredEmail: email.trim(),
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Create account</h1>
        <p className="login-card__sub">Sign up to book tickets. Browsing stays free.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="reg-name">Name</label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Creating account…" : "Register"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>
        <p className="login-card__footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
