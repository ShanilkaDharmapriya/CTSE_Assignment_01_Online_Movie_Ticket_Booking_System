import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loginRequest } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Success message after registration (see Register.jsx navigate state)
  const registerSuccess = location.state?.registered === true;
  const prefilledEmail = location.state?.registeredEmail;

  useEffect(() => {
    if (prefilledEmail && !email) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail, email]);

  /**
   * If already signed in (e.g. opened /login by mistake), or right after a successful
   * login() call below — send user to the right place. Uses location.state.from so
   * customers return to showtimes after booking prompted login.
   */
  useEffect(() => {
    if (!isAuthenticated) return;
    const returnTo = location.state?.from;
    if (!isAdmin && returnTo && typeof returnTo === "string") {
      navigate(returnTo, { replace: true });
    } else {
      navigate(isAdmin ? "/admin" : "/", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location.state?.from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await loginRequest(email.trim(), password);
      const payload = res?.data;
      if (!payload?.token || !payload?.user) {
        setError("Unexpected response from server.");
        return;
      }
      login(payload.token, payload.user);
      window.alert(`Welcome back, ${payload.user.name}!`);
      // Redirect is handled by the useEffect above once isAuthenticated flips to true
    } catch (err) {
      // Auth-service: { error: { message } }; gateway: { error: { details } }
      const msg =
        err.response?.data?.error?.message ||
        err.response?.data?.error?.details ||
        err.response?.data?.message ||
        err.message ||
        "Login failed.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Sign in</h1>
        <p className="login-card__sub">Sign in when you are ready to book tickets.</p>

        {registerSuccess && (
          <p className="form-success" role="status">
            Account created. You can sign in now.
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <p className="form-error">{error}</p>}
        </form>

        <p className="login-card__footer">
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}
