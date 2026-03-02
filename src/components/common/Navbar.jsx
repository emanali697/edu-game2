import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";
import { logoutUser } from "@services/auth";
import { APP_NAME } from "@utils/constants";

export default function Navbar() {
  const { isLoggedIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide navbar on game play page
  if (location.pathname === "/play") return null;

  async function handleLogout() {
    await logoutUser();
    navigate("/");
  }

  return (
    <nav className="navbar navbar-expand-lg shadow-sm sticky-top" style={{ background: "#fff", borderBottom: "2px solid var(--c-border)" }}>
      <div className="container">
        <Link to="/" className="navbar-brand f-display fs-5 text-c-primary text-decoration-none">
          🎮 {APP_NAME}
        </Link>

        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navMenu">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {!isLoggedIn && (
              <li className="nav-item">
                <Link to="/setup" className="nav-link f-body">ابدأ اللعب</Link>
              </li>
            )}
            {isLoggedIn && (
              <>
                <li className="nav-item">
                  <Link to="/dashboard" className="nav-link f-body">لوحة التحكم</Link>
                </li>
                <li className="nav-item">
                  <Link to="/achievements" className="nav-link f-body">الإنجازات</Link>
                </li>
                <li className="nav-item">
                  <Link to="/subscription" className="nav-link f-body">الاشتراك</Link>
                </li>
              </>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link to="/admin" className="nav-link f-body text-danger">الإدارة</Link>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-2">
            {isLoggedIn ? (
              <>
                <span className="f-body small text-c-light d-none d-lg-inline">
                  {user?.displayName || user?.email}
                </span>
                <button onClick={handleLogout} className="btn btn-sm btn-outline-secondary f-body">
                  تسجيل خروج
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-sm btn-outline-secondary f-body">دخول</Link>
                <Link to="/register" className="btn btn-sm btn-primary f-body">حساب جديد</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
