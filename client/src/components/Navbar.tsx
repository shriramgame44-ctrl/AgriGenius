import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { SanctuaryDirectoryModal } from "./SanctuaryDirectoryModal";
import {
  Sprout,
  Menu,
  X,
  LogOut,
  User,
  HeartHandshake,
  PlusCircle,
  LayoutDashboard,
  History,
  Settings,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6 text-emerald-100" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-slate-900 font-serif">
                    Agri<span className="text-emerald-700">Genius</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold uppercase tracking-wider text-emerald-800/80 bg-emerald-50 px-1.5 py-0.5 rounded ml-2 border border-emerald-200/50">
                    AI Agronomy
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            {user ? (
              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={() => setSanctuaryModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>Sanctuary Directory</span>
                </button>

                <Link
                  to="/advisory/new-crop"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Crop Advisory</span>
                </Link>

                <div className="h-6 w-px bg-slate-200" />

                {/* User Context */}
                <div className="flex items-center space-x-3">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 text-slate-700 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[120px]">
                        {user.farmName || user.email}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSanctuaryModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60 rounded-lg transition-colors cursor-pointer"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>Sanctuary Directory</span>
                </button>

                <Link
                  to="/auth/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-all shadow-sm shadow-emerald-700/20"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            {user && (
              <div className="flex md:hidden">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                <p className="text-xs text-slate-500">{user.farmName || user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 font-semibold px-2 py-1 rounded bg-rose-50"
              >
                Log Out
              </button>
            </div>

            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link
              to="/advisory/new-crop"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Crop Advisory Wizard</span>
            </Link>
            <Link
              to="/advisory/livestock-care"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Cattle Welfare Advisory</span>
            </Link>
            <Link
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <History className="w-4 h-4" />
              <span>Advisory Archive</span>
            </Link>
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <Settings className="w-4 h-4" />
              <span>Settings & Farm Profile</span>
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setSanctuaryModalOpen(true);
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-600" />
              <span>Open Sanctuary Directory</span>
            </button>
          </div>
        )}
      </header>

      {/* Sanctuary Directory Modal */}
      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
        defaultRegion={user?.locationRegion || ""}
      />
    </>
  );
};
