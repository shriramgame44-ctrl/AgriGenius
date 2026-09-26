import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { useAgri } from "../context/AgriContext";
import { SanctuaryDirectoryModal } from "./SanctuaryDirectoryModal";
import { VoiceAssistantModal } from "./VoiceAssistantModal";
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
  Mic,
  Wifi,
  WifiOff,
  Globe,
  ShoppingCart,
  MessageCircle,
  RefreshCw,
  Camera,
  Wallet,
  Tractor,
  Layers,
  Building2,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const {
    language,
    setLanguage,
    t,
    isOffline,
    toggleOffline,
    pendingSyncCount,
    isSyncing,
    cart,
    setVoiceModalOpen,
  } = useAgri();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
        {/* Offline Sync Banner if syncing or pending */}
        {isOffline && (
          <div className="bg-amber-600 text-white text-[11px] font-bold px-4 py-1 text-center flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              {language === "hi"
                ? "ऑफ़लाइन मोड सक्रिय: सभी लेन-देन और स्कैन फोन में सुरक्षित हैं।"
                : "Field Offline Mode: Actions cached locally. Will auto-sync when cellular signal returns."}
            </span>
            {pendingSyncCount > 0 && (
              <span className="bg-amber-800 px-1.5 py-0.2 rounded text-[10px]">
                {pendingSyncCount} pending
              </span>
            )}
          </div>
        )}

        {isSyncing && (
          <div className="bg-emerald-700 text-white text-[11px] font-bold px-4 py-1 text-center flex items-center justify-center gap-2 animate-fade-in">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Reconnecting to cloud... Synchronizing offline transactions.</span>
          </div>
        )}

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
                  <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded ml-2 border border-emerald-200">
                    Smart Farmer App
                  </span>
                </div>
              </Link>
            </div>

            {/* Center / Right Controls: Language, Offline Toggle, Voice, Cart */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Dynamic Regional Language Switcher */}
              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-slate-500 mx-1 hidden sm:inline" />
                <button
                  onClick={() => setLanguage("en")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    language === "en" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage("hi")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    language === "hi" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setLanguage("mr")}
                  className={`px-2 py-0.5 rounded-lg transition-all ${
                    language === "mr" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  मराठी
                </button>
              </div>

              {/* Offline Field Mode Toggle */}
              <button
                onClick={toggleOffline}
                className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                  isOffline
                    ? "bg-amber-50 text-amber-900 border-amber-300"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
                title={isOffline ? "Switch to Online Mode" : "Simulate Field Offline Mode"}
              >
                {isOffline ? (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                    <span>Offline</span>
                  </>
                ) : (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Online</span>
                  </>
                )}
              </button>

              {/* Universal Voice Assistant Trigger */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="p-2 sm:px-3 sm:py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-transform active:scale-95 cursor-pointer"
                title="Tap to Speak with AI Assistant"
              >
                <Mic className="w-4 h-4 animate-pulse" />
                <span className="hidden md:inline">Voice Assistant</span>
              </button>

              {/* Cart Button */}
              {user && (
                <Link
                  to="/store"
                  className="relative p-2 rounded-xl text-slate-700 hover:bg-stone-100 transition-colors"
                  title="Fertilizer Cart"
                >
                  <ShoppingCart className="w-5 h-5 text-slate-700" />
                  {cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {cart.reduce((s, i) => s + i.quantity, 0)}
                    </span>
                  )}
                </Link>
              )}

              {/* User Profile / Logout */}
              {user ? (
                <div className="hidden lg:flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/settings"
                    className="flex items-center space-x-2 text-slate-700 hover:text-emerald-700 p-1 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                      {user.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="hidden sm:flex items-center space-x-2">
                  <Link
                    to="/auth/login"
                    className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                  >
                    Register
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
        </div>

        {/* Mobile Navigation Drawer */}
        {user && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 animate-fade-in">
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
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>{t("command_center")}</span>
            </Link>

            <Link
              to="/scanner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>{t("ai_crop_scanner")}</span>
            </Link>

            <Link
              to="/store"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <ShoppingCart className="w-4 h-4 text-amber-600" />
              <span>{t("buy_fertilizers")}</span>
            </Link>

            <Link
              to="/marketplace"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <Sprout className="w-4 h-4 text-blue-600" />
              <span>{t("sell_produce")}</span>
            </Link>

            <Link
              to="/chat"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <MessageCircle className="w-4 h-4 text-purple-600" />
              <span>{t("direct_chat")}</span>
            </Link>

            <Link
              to="/ledger"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>{t("khata_ledger")}</span>
            </Link>

            <Link
              to="/equipment"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <Tractor className="w-4 h-4 text-teal-600" />
              <span>{t("tractor_rental")}</span>
            </Link>

            <Link
              to="/fields"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50"
            >
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>{t("farm_mapping")}</span>
            </Link>

            <Link
              to="/schemes"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-rose-800 bg-rose-50"
            >
              <Building2 className="w-4 h-4 text-rose-600" />
              <span>{t("gov_schemes")}</span>
            </Link>
          </div>
        )}
      </header>

      {/* Sanctuary Directory Modal */}
      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
        defaultRegion={user?.locationRegion || ""}
      />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal />
    </>
  );
};
