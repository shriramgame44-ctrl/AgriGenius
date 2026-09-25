import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAdvisory } from "../api/advisory.api";
import { ScoreGuage } from "../components/ScoreGuage";
import { FertilizerTimeline } from "../components/FertilizerTimeline";
import { EconomicBarChart } from "../components/EconomicBarChart";
import { SustainablePathwayCard } from "../components/SustainablePathwayCard";
import { PdfExportButton } from "../components/PdfExportButton";
import { SanctuaryDirectoryModal } from "../components/SanctuaryDirectoryModal";
import {
  CropAdvisoryResponse,
  LivestockWelfareResponse,
} from "../types";
import {
  Sprout,
  HeartHandshake,
  Calendar,
  Droplet,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Bug,
  Leaf,
  Sparkles,
  Loader2,
  AlertTriangle,
  Building2,
  CheckCircle2,
} from "lucide-react";

export const AdvisoryResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: advisory, isLoading, isError, error } = useAdvisory(id);
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="py-24 text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Fetching Advisory Record...</h3>
        <p className="text-xs text-slate-500">Querying PostgreSQL database and loading telemetry</p>
      </div>
    );
  }

  if (isError || !advisory) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Advisory Not Found</h3>
        <p className="text-xs text-slate-500">
          {(error as any)?.message || "The requested advisory report could not be retrieved."}
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isCrop = advisory.advisory_type === "CROP";
  const cropData = isCrop ? (advisory.advisory_response as CropAdvisoryResponse) : null;
  const livestockData = !isCrop ? (advisory.advisory_response as LivestockWelfareResponse) : null;

  const dateFormatted = new Date(advisory.created_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </Link>

        <div className="flex items-center gap-3">
          {!isCrop && (
            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Sanctuary Directory</span>
            </button>
          )}

          <PdfExportButton advisoryId={advisory.id} title={advisory.title} variant="primary" />
        </div>
      </div>

      {/* Main Advisory Header Card */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border shadow-sm ${
          isCrop
            ? "bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 text-white border-emerald-800"
            : "bg-gradient-to-br from-stone-900 via-amber-950 to-stone-900 text-white border-amber-900/50"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  isCrop ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {isCrop ? "Precision Crop Intelligence" : "Ethical Cattle Preservation Blueprint"}
              </span>
              <span className="text-xs text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {dateFormatted}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white leading-tight">
              {advisory.title}
            </h1>

            {isCrop && cropData && (
              <p className="text-emerald-100/90 text-sm leading-relaxed">
                Botanical Recommendation: <strong className="text-white">{cropData.recommendedCrop}</strong> (
                <em>{cropData.scientificName}</em>) • {cropData.growthDurationDays} Days Growth Duration
              </p>
            )}

            {!isCrop && (
              <p className="text-amber-100/90 text-sm leading-relaxed">
                Targeting compassionate herd stabilization, ration optimization, and value-added bio-product monetization without distress liquidation.
              </p>
            )}
          </div>

          {/* Quick Score Gauge Display */}
          <div className="self-center md:self-auto">
            {isCrop && cropData && (
              <ScoreGuage
                score={cropData.suitabilityScore}
                label="Agronomic Suitability"
                sublabel="Climate & Soil Match"
                size={140}
              />
            )}
            {!isCrop && livestockData && (
              <ScoreGuage
                score={livestockData.welfareStatusIndex}
                label="Herd Welfare Index"
                sublabel="Health & Preservation"
                size={140}
              />
            )}
          </div>
        </div>
      </div>

      {/* CROP ADVISORY DETAILS */}
      {isCrop && cropData && (
        <div className="space-y-8">
          {/* Key Metric Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <Droplet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Water Requirement</span>
                <span className="text-sm font-bold text-slate-900">{cropData.waterRequirement}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Growth Timeline</span>
                <span className="text-sm font-bold text-slate-900">{cropData.growthDurationDays} Days to Harvest</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center gap-3.5">
              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Break-Even Point</span>
                <span className="text-sm font-bold text-slate-900">
                  {cropData.economicForecast.breakEvenTimelineMonths} Months
                </span>
              </div>
            </div>
          </div>

          {/* Rationale Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-600" />
              <span>Scientific Agronomic Rationale</span>
            </h3>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">{cropData.rationale}</p>
          </div>

          {/* Fertilizer Timeline & Economic Forecast Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <FertilizerTimeline schedule={cropData.fertilizerSchedule} />
            <div className="space-y-8">
              <EconomicBarChart forecast={cropData.economicForecast} />

              {/* Sustainable Practices */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Recommended Sustainable Practices</span>
                </h3>
                <ul className="space-y-2.5">
                  {cropData.sustainablePractices.map((practice, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Pest & Disease Mitigation Cards */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-700">
                <Bug className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Integrated Pest & Disease Diagnosis</h3>
                <p className="text-xs text-slate-500">Biological and low-impact organic intervention roadmaps</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {cropData.pestRiskMitigation.map((pest, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-stone-200/80 bg-stone-50/50 hover:bg-white hover:border-amber-300 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>{pest.pestOrDisease}</span>
                    </h4>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Recognizable Symptoms:
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">{pest.symptoms}</p>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Preventive Strategy:
                    </span>
                    <p className="text-xs text-slate-700 mt-0.5">{pest.preventiveAction}</p>
                  </div>

                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
                      <Leaf className="w-3 h-3 text-emerald-600" />
                      Eco-Friendly Control:
                    </span>
                    <p className="text-xs text-emerald-900 font-medium mt-0.5">{pest.ecoFriendlyControl}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* LIVESTOCK WELFARE ADVISORY DETAILS */}
      {!isCrop && livestockData && (
        <div className="space-y-8">
          {/* Immediate Interventions */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="p-2 bg-rose-50 rounded-xl text-rose-700">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Immediate Clinical & Welfare Interventions</h3>
                <p className="text-xs text-slate-500">Prioritized triage actions to ensure herd stabilization and comfort</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              {livestockData.immediateInterventions.map((item, idx) => {
                const isCrit = item.priority === "CRITICAL";
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isCrit
                        ? "bg-rose-50/50 border-rose-200"
                        : "bg-stone-50 border-stone-200/80"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isCrit
                            ? "bg-rose-600 text-white"
                            : "bg-emerald-700 text-white"
                        }`}
                      >
                        {item.priority}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm">{item.actionItem}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-1">
                      {item.implementationDetails}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sustainable Economic Pathways (Slaughter-prevention monetization) */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold font-serif text-slate-900">
                Sustainable Economic Pathways (Slaughter-Free Viability)
              </h3>
              <p className="text-xs text-slate-500">
                Turn-key biological monetization models that generate revenue from herd manure, biogas, and organic formulations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {livestockData.sustainableEconomicPathways.map((pathway, idx) => (
                <SustainablePathwayCard key={idx} pathway={pathway} />
              ))}
            </div>
          </div>

          {/* Nutritional Optimization & Local Feed Substitutes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Leaf className="w-5 h-5 text-emerald-600" />
                <span>Nutritional Plan & Ration Balancing</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-stone-50 p-4 rounded-2xl border border-stone-200/70">
                {livestockData.nutritionalOptimization.rationBalancingPlan}
              </p>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Low-Cost Local Feed Substitutes:
                </span>
                <ul className="space-y-2">
                  {livestockData.nutritionalOptimization.lowCostLocalFeedSubstitutes.map((feed, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{feed}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl text-emerald-900 text-xs">
                <strong>Hydration & Minerals:</strong> {livestockData.nutritionalOptimization.mineralAndHydrationProtocol}
              </div>
            </div>

            {/* Shelter & Ethno-Veterinary Management */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <span>Shelter Upgrades & Ethno-Veterinary Care</span>
              </h3>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/70 text-xs sm:text-sm text-slate-700">
                <strong className="block text-slate-900 mb-1">Space & Ventilation Upgrades:</strong>
                <p>{livestockData.shelterAndDiseaseManagement.spaceAndVentilationUpgrades}</p>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Traditional Herbal / Ethno-Veterinary Remedies:
                </span>
                <ul className="space-y-2">
                  {livestockData.shelterAndDiseaseManagement.ethnoVeterinaryRemedies.map((rem, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
                  Prophylactic Vaccinations:
                </span>
                <div className="flex flex-wrap gap-2">
                  {livestockData.shelterAndDiseaseManagement.preventativeHealthAndVaccination.map((vax, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-800">
                      {vax}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sanctuary Referral Recommendation Banner */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white uppercase tracking-wider inline-block">
                Sanctuary & Gaushala Support Framework
              </span>
              <h4 className="text-xl font-bold font-serif">
                {livestockData.sanctuaryAndSupportReferrals.assistanceType}
              </h4>
              <p className="text-xs sm:text-sm text-amber-50 leading-relaxed">
                {livestockData.sanctuaryAndSupportReferrals.recommendation}
              </p>
              <p className="text-[11px] text-amber-100">
                <strong>Eligibility:</strong> {livestockData.sanctuaryAndSupportReferrals.qualificationCriteria}
              </p>
            </div>

            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="px-6 py-3.5 bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-2xl shadow-sm transition-all whitespace-nowrap self-start sm:self-center cursor-pointer"
            >
              Browse Accredited Sanctuaries
            </button>
          </div>
        </div>
      )}

      {/* Sanctuary Directory Modal */}
      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
      />
    </div>
  );
};
