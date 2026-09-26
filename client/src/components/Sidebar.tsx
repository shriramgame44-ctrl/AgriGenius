import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { SanctuaryDirectoryModal } from "./SanctuaryDirectoryModal";
import { useAuth } from "../api/auth.api";
import { useAgri } from "../context/AgriContext";
import {
  LayoutDashboard,
  Camera,
  ShoppingCart,
  TrendingUp,
  MessageCircle,
  Wallet,
  Tractor,
  Layers,
  Sprout,
  HeartHandshake,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
  Building2,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const { t } = useAgri();
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const mainNav = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
      label: t("command_center"),
    },
    {
      to: "/scanner",
      icon: <Camera className="w-4 h-4 text-emerald-600" />,
      label: t("ai_crop_scanner"),
      badge: "AI Vision",
    },
    {
      to: "/store",
      icon: <ShoppingCart className="w-4 h-4 text-amber-600" />,
      label: t("buy_fertilizers"),
      badge: "Subsidies",
    },
    {
      to: "/marketplace",
      icon: <TrendingUp className="w-4 h-4 text-blue-600" />,
      label: t("sell_produce"),
      badge: "Mandi",
    },
    {
      to: "/chat",
      icon: <MessageCircle className="w-4 h-4 text-purple-600" />,
      label: t("direct_chat"),
      badge: "Live DMs",
    },
    {
      to: "/ledger",
      icon: <Wallet className="w-4 h-4 text-emerald-700" />,
      label: t("khata_ledger"),
    },
    {
      to: "/equipment",
      icon: <Tractor className="w-4 h-4 text-teal-600" />,
      label: t("tractor_rental"),
    },
    {
      to: "/fields",
      icon: <Layers className="w-4 h-4 text-indigo-600" />,
      label: t("farm_mapping"),
      badge: "NDVI",
    },
    {
      to: "/schemes",
      icon: <Building2 className="w-4 h-4 text-rose-600" />,
      label: t("gov_schemes"),
      badge: "Grants",
    },
  ];

  const advisoryNav = [
    {
      to: "/advisory/new-crop",
      icon: <Sprout className="w-4 h-4 text-emerald-600" />,
      label: t("crop_wizard"),
    },
    {
      to: "/advisory/livestock-care",
      icon: <HeartHandshake className="w-4 h-4 text-amber-600" />,
      label: t("livestock_care"),
    },
    {
      to: "/history",
      icon: <History className="w-4 h-4 text-slate-500" />,
      label: t("advisory_archive"),
    },
    {
      to: "/settings",
      icon: <Settings className="w-4 h-4 text-slate-500" />,
      label: t("farm_settings"),
    },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200/90 p-4 min-h-[calc(100vh-4rem)] justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Main Farmer Tools */}
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              {t("farmer_suite_title")}
            </span>
            {mainNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-stone-100 text-slate-600">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* AI Advisory Suite */}
          <div className="space-y-1 pt-2 border-t border-stone-100">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
              Agronomy Intelligence
            </span>
            {advisoryNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                      : "text-slate-600 hover:text-slate-900 hover:bg-stone-50"
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Cattle Welfare Callout */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/70 border border-amber-200/80">
            <div className="flex items-center gap-1.5 mb-1 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="text-[11px] font-bold uppercase tracking-wide">
                {t("sanctuary_directory")}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed mb-2.5">
              Connect elderly cattle with verified shelters & bio-energy trusts.
            </p>
            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="w-full py-1.5 px-2 bg-white text-amber-900 font-bold text-[11px] rounded-lg border border-amber-200 hover:bg-amber-100/50 transition-colors shadow-xs cursor-pointer"
            >
              Open Directory
            </button>
          </div>
        </div>

        {/* Gemini Engine Status */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700 text-[11px]">Gemini 2.0 Multimodal</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Engine Active" />
        </div>
      </aside>

      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
        defaultRegion={user?.locationRegion || ""}
      />
    </>
  );
};
