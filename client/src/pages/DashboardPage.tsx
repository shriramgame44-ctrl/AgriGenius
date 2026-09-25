import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/auth.api";
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
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { data: advisoriesData, isLoading } = useAdvisories(1, 6);
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  const advisories = advisoriesData?.data || [];
  const totalCount = advisoriesData?.pagination?.totalRecords || 0;

  // Compute summary stats
  const cropCount = advisories.filter((a) => a.advisory_type === "CROP").length;
  const livestockCount = advisories.filter((a) => a.advisory_type === "LIVESTOCK_WELFARE").length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-850 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {user?.locationRegion || "Agricultural Zone"} • {user?.preferredUnits || "METRIC"} Units
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-white">
            Welcome back, {user?.fullName || "Farmer"}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            {user?.farmName ? `Managing ${user.farmName}. ` : ""}
            Your agronomy telemetry is active. Evaluate field soil chemistry, request crop schedules, or construct ethical preservation roadmaps for your cattle herds.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/advisory/new-crop"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm cursor-pointer"
            >
              <Sprout className="w-4 h-4" />
              <span>New Crop Advisory</span>
            </Link>

            <Link
              to="/advisory/livestock-care"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
            >
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              <span>Cattle Welfare Wizard</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Total Advisories
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              {totalCount}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Stored in cloud records</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Active Crop Plans
            </span>
            <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">
              {cropCount}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Optimized rotations</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700">
            <Sprout className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Cattle Preserved
            </span>
            <span className="text-2xl font-extrabold text-amber-700 mt-1 block">
              {livestockCount} Plans
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 block">100% slaughter-free</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-2xl text-amber-700">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Verified Gaushalas
            </span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
              50+ Shelters
            </span>
            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="text-[11px] font-bold text-emerald-700 hover:underline mt-0.5 block"
            >
              Explore Directory →
            </button>
          </div>
          <div className="p-3 bg-teal-50 rounded-2xl text-teal-700">
            <HeartHandshake className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Launch Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-3xl border border-emerald-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 bg-emerald-600 text-white rounded-xl">
                <Sprout className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Multi-Factor Crop Advisory Wizard</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Enter your plot dimensions, soil pH, N-P-K readings, and seasonal goals. Gemini 2.5 Flash computes optimal varieties, phased fertilizer schedules, and biological pest controls.
            </p>
          </div>
          <Link
            to="/advisory/new-crop"
            className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <span>Launch Crop Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-3xl border border-amber-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="p-2 bg-amber-600 text-white rounded-xl">
                <HeartHandshake className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900">Cattle Welfare & Preservation Engine</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
              Protect elderly, non-milking, or rescued bovines from distress liquidation. Generate tailored nutrition balance, biogas energy plans, vermicompost monetization, and sanctuary support.
            </p>
          </div>
          <Link
            to="/advisory/livestock-care"
            className="inline-flex items-center justify-center gap-2 py-3 px-4 bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <span>Launch Livestock Care Wizard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Recent Advisories Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Generated Advisories</h2>
            <p className="text-xs text-slate-500">Structured reports validated by Gemini AI and saved to PostgreSQL</p>
          </div>
          <Link
            to="/history"
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>View All Records</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading recent agricultural advisories...
          </div>
        ) : advisories.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-700">No Advisory Reports Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by running the Crop Advisory Wizard or Cattle Welfare Wizard to receive your first scientific action plan.
            </p>
            <div className="pt-2">
              <Link
                to="/advisory/new-crop"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-emerald-800"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Advisory</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {advisories.map((adv) => {
              const isCrop = adv.advisory_type === "CROP";
              const dateStr = new Date(adv.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={adv.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-50/60 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        isCrop ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isCrop ? <Sprout className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isCrop ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isCrop ? "Crop Science" : "Cattle Welfare"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">{adv.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <PdfExportButton advisoryId={adv.id} title={adv.title} variant="secondary" />
                    <Link
                      to={`/advisory/results/${adv.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      View Report
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sanctuary Directory Modal */}
      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
        defaultRegion={user?.locationRegion || ""}
      />
    </div>
  );
};
