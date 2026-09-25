import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { SanctuaryDirectoryModal } from "./SanctuaryDirectoryModal";
import { useAuth } from "../api/auth.api";
import {
  LayoutDashboard,
  Sprout,
  HeartHandshake,
  History,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const navItems = [
    {
      to: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: "Command Center",
    },
    {
      to: "/advisory/new-crop",
      icon: <Sprout className="w-5 h-5 text-emerald-600" />,
      label: "Crop Advisory Wizard",
    },
    {
      to: "/advisory/livestock-care",
      icon: <HeartHandshake className="w-5 h-5 text-amber-600" />,
      label: "Cattle Welfare Advisory",
    },
    {
      to: "/history",
      icon: <History className="w-5 h-5" />,
      label: "Advisory Archive",
    },
    {
      to: "/settings",
      icon: <Settings className="w-5 h-5" />,
      label: "Farm Settings",
    },
  ];

  return (
    <>
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-stone-200/80 p-4 min-h-[calc(100vh-4rem)] justify-between">
        <div className="space-y-6">
          {/* Navigation Links */}
          <div className="space-y-1">
            <span className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Menu
            </span>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs"
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
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/60">
            <div className="flex items-center gap-2 mb-2 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wide">Preservation Net</span>
            </div>
            <p className="text-xs text-amber-900/80 leading-relaxed mb-3">
              Connect at-risk cattle herds with accredited Gaushalas, biogas cooperatives, and ethno-veterinary care.
            </p>
            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="w-full py-2 px-3 bg-white text-amber-900 font-bold text-xs rounded-xl border border-amber-200 hover:bg-amber-100/50 transition-colors shadow-xs"
            >
              Open Directory
            </button>
          </div>
        </div>

        {/* Gemini Engine Status Badge */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-semibold text-slate-700">Gemini 2.5 Flash</span>
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
