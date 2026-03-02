import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  const location = useLocation(); // ✅ احفظ الصفحة الحالية

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center">
          <div className="spinner-border text-c-primary mb-3" role="status" />
          <p className="f-body text-c-light">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return (
    <Navigate to={`/login?redirect=${location.pathname}`} replace /> // ✅ مرر الصفحة الحالية
  );
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;

  return children;
}