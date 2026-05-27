import { useAuth } from "../../contexts/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserRole } from "../../contexts/AuthContext";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex bg-[#f8fafc] h-screen items-center justify-center">
        <div className="border-4 h-12 w-12 border-t-teal border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    if (location.pathname === "/") {
      return <Navigate to="/landing" replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    user &&
    !profile &&
    location.pathname !== "/register" &&
    location.pathname !== "/login" &&
    location.pathname !== "/verify-ktp"
  ) {
    return <Navigate to="/register" replace />;
  }

  // If KTP not verified and NOT on verification page, redirect to verification
  // Validators don't need to be verified by this gate usually, or they are auto-verified
  if (
    profile &&
    profile.role !== "validator" &&
    profile.verificationStatus !== "verified" &&
    profile.verificationStatus !== "pending" &&
    location.pathname !== "/verify-ktp"
  ) {
    return <Navigate to="/verify-ktp" replace />;
  }

  // Role based access
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
