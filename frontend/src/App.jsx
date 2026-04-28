import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Navbar from "./components/Navbar.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import ShowPage from "./pages/ShowPage.jsx";
import Admin from "./pages/Admin.jsx";
import AdminManage from "./pages/AdminManage.jsx";
import Payment from "./pages/Payment.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import "./App.css";

/**
 * Public shell: navbar + child routes (home, showtimes).
 * No login required to view movies or shows.
 */
function PublicLayout() {
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}

/**
 * Admin dashboard — only users with role ADMIN.
 * Anyone else (including guests) is sent to login.
 */
function AdminRoute() {
  const { user, isAdmin } = useAuth();
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public: browse without signing in */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="movies/:movieId/shows" element={<ShowPage />} />
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/payment" element={<Payment />} />

      <Route path="/my-bookings" element={<ProtectedRoute />}>
        <Route index element={<MyBookings />} />
      </Route>

      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Admin />} />
        <Route path="manage" element={<AdminManage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
