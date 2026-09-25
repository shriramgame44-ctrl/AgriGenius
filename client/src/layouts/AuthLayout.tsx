import React from "react";
import { Outlet, Navigate, Link } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { Sprout } from "lucide-react";

export const AuthLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 gradient-mesh">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center space-x-2.5 mb-6 group">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700 flex items-center justify-center text-white shadow-lg shadow-emerald-700/30 group-hover:scale-105 transition-transform">
            <Sprout className="w-7 h-7 text-emerald-100" />
          </div>
          <span className="text-2xl font-bold font-serif text-slate-900 tracking-tight">
            Agri<span className="text-emerald-700">Genius</span>
          </span>
        </Link>
      </div>

      <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl shadow-stone-200/50 rounded-3xl border border-stone-200/80">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
