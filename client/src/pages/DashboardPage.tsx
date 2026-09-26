import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { useAgri } from "../context/AgriContext";
import { useAdvisories } from "../api/advisory.api";
import { SanctuaryDirectoryModal } from "../components/SanctuaryDirectoryModal";
import { PdfExportButton } from "../components/PdfExportButton";
import {
  Sprout,
  HeartHandshake,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
  PlusCircle,
  FileText,
  Camera,
  ShoppingCart,
  MessageCircle,
  Wallet,
  Tractor,
  CloudSun,
  Wind,
  Droplets,
  CheckCircle2,
  Sparkles,
  Building2,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useAgri();
  const { data: advisoriesData, isLoading } = useAdvisories(1, 4);
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const advisories = advisoriesData?.data || [];
  const totalCount = advisoriesData?.pagination?.totalRecords || 0;

  return (
    <div className="space-y-6">
      {/* 1. Hyper-Local Ag-Weather & Pesticide Spraying Advisory Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md border border-emerald-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-emerald-200">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              <span>{user?.locationRegion || "Rampur Agricultural Zone, Punjab (30.1°N)"}</span>
              <span>•</span>
              <span className="bg-emerald-800/80 px-2 py-0.5 rounded-full text-[10px] font-bold">
                1 km² Ag-Weather Grid
              </span>
            </div>

            <div className="flex items-center gap-4 pt-1">
              <div className="flex items-center gap-2">
                <CloudSun className="w-7 h-7 text-amber-400" />
                <span className="text-2xl font-black">28°C</span>
              </div>
              <div className="h-6 w-px bg-emerald-700/60" />
              <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                <Droplets className="w-4 h-4 text-cyan-300" />
                <span>62% {t("humidity")}</span>
              </div>
              <div className="h-6 w-px bg-emerald-700/60" />
              <div className="flex items-center gap-1.5 text-xs text-emerald-100">
                <Wind className="w-4 h-4 text-emerald-300" />
                <span>7 km/h {t("wind")} ({t("gentle_wind")})</span>
              </div>
            </div>
          </div>

          {/* Actionable Spray Window Badge */}
          <div className="w-full md:w-auto p-3 bg-emerald-800/80 border border-emerald-600 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
            <div>
              <span className="text-xs font-black uppercase text-emerald-200 block">
                {t("spray_advisory")}
              </span>
              <p className="text-xs text-white font-medium">
                {t("ideal_spray_window")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rural Quick Action 6-Card Grid (Large Tactile Targets, Outdoor Sunlight Contrast) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider">
            {t("farmer_suite_title")}
          </h2>
          <span className="text-xs text-slate-500">{t("farmer_suite_desc")}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Card 1: AI Crop Disease Scanner */}
          <Link
            to="/scanner"
            className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                AI Vision
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("ai_crop_scanner")}</h3>
              <p className="text-xs text-emerald-100 mt-0.5">
                {t("scanner_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 2: Buy Fertilizers & Agri-Inputs */}
          <Link
            to="/store"
            className="p-5 rounded-3xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                {t("subsidized_badge")}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("buy_fertilizers")}</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                {t("store_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 3: Sell Produce (Marketplace) */}
          <Link
            to="/marketplace"
            className="p-5 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-800 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Mandi
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("sell_produce")}</h3>
              <p className="text-xs text-blue-100 mt-0.5">
                {t("market_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 4: Instagram-Style Direct Chat */}
          <Link
            to="/chat"
            className="p-5 rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Live DMs
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("direct_chat")}</h3>
              <p className="text-xs text-purple-100 mt-0.5">
                {t("chat_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 5: Peer-to-Peer Machinery Rental */}
          <Link
            to="/equipment"
            className="p-5 rounded-3xl bg-gradient-to-br from-teal-600 to-teal-800 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <Tractor className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Hourly
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("tractor_rental")}</h3>
              <p className="text-xs text-teal-100 mt-0.5">
                {t("machinery_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 6: Khata / Farm Ledger */}
          <Link
            to="/ledger"
            className="p-5 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-950 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                P&L
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("khata_ledger")}</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {t("ledger_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 7: Satellite Farm Acreage & Perimeter */}
          <Link
            to="/fields"
            className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                NDVI / GPS
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("farm_mapping")}</h3>
              <p className="text-xs text-indigo-100 mt-0.5">
                {t("mapping_card_desc")}
              </p>
            </div>
          </Link>

          {/* Card 8: Government Grants & Subsidies */}
          <Link
            to="/schemes"
            className="p-5 rounded-3xl bg-gradient-to-br from-rose-700 to-rose-900 text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 flex flex-col justify-between min-h-[140px]"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-white/20 backdrop-blur-xs rounded-2xl">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="bg-white/20 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                Govt Grants
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{t("gov_schemes")}</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                {t("schemes_card_desc")}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* 3. Recent Advisories & Telemetry */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t("recent_reports")}</h2>
            <p className="text-xs text-slate-500">Cloud-synced crop and cattle preservation plans</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>{t("view_all")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            Loading agricultural telemetry...
          </div>
        ) : advisories.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <p className="text-xs text-slate-500">No advisory reports yet.</p>
            <Link
              to="/advisory/new-crop"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 text-white rounded-xl text-xs font-bold"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{t("new_crop_advisory")}</span>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {advisories.map((adv) => {
              const isCrop = adv.advisory_type === "CROP";
              return (
                <div
                  key={adv.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl ${
                        isCrop ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isCrop ? <Sprout className="w-4 h-4" /> : <HeartHandshake className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{adv.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(adv.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/advisory/results/${adv.id}`}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white hover:bg-slate-800"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
        defaultRegion={user?.locationRegion || ""}
      />
    </div>
  );
};
