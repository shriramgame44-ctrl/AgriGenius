import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { Loader2 } from "lucide-react";

export const AppLayout: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
        <p className="text-sm font-semibold tracking-wide">Loading AgriGenius Workspace...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-slate-900">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
