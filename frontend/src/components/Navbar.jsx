import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="navbar">
      <Link to={isAdmin ? "/admin" : "/"} className="navbar__brand">
        CINE<span>BOOK</span>
      </Link>
      <div className="navbar__actions">
        {user && (
          <>
            <span className="navbar__user">
              {user.name}
              <span className="navbar__role"> · {isAdmin ? "Admin" : "User"}</span>
            </span>
            {isAdmin && (
              <>
                <Link to="/admin" className="btn btn--ghost">
                  Admin create
                </Link>
                <Link to="/admin/manage" className="btn btn--ghost">
                  Admin manage
                </Link>
                <Link to="/" className="btn btn--ghost">
                  Browse movies
                </Link>
              </>
            )}
            {!isAdmin && (
              <>
                <Link to="/" className="btn btn--ghost">
                  Browse movies
                </Link>
                <Link to="/my-bookings" className="btn btn--ghost">
                  My bookings
                </Link>
              </>
            )}
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
        {!isAuthenticated && (
          <>
            <Link to="/login" className="btn btn--ghost">
              Login
            </Link>
            <Link to="/register" className="btn btn--primary">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
