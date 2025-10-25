import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: ("student" | "instructor")[];
}

const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (roles && profile && !roles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
