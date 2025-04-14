import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("token"); // isAuthenticated

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};