import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { Navbar } from "../components/Navbar";
import { SanctuaryDirectoryModal } from "../components/SanctuaryDirectoryModal";
import {
  Sprout,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Flame,
  Recycle,
  BarChart3,
  Layers,
  Leaf,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 gradient-mesh border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Powered by Google Gemini 2.5 Flash</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                Data-Driven Precision Agronomy & <br className="hidden sm:inline" />
                <span className="text-emerald-700 italic">Ethical Cattle Preservation</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Empower your agricultural enterprise with hyper-localized crop intelligence, soil chemistry optimization, and compassionate bovine welfare strategies that prevent distress selling and slaughter.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={user ? "/advisory/new-crop" : "/auth/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Sprout className="w-5 h-5 text-emerald-200" />
                  <span>Launch Crop Advisory</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={user ? "/advisory/livestock-care" : "/auth/register"}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50/60 text-slate-800 font-bold text-base border border-stone-200 shadow-sm transition-all"
                >
                  <HeartHandshake className="w-5 h-5 text-amber-600" />
                  <span>Cattle Welfare Wizard</span>
                </Link>
              </div>

              {/* Highlights badge row */}
              <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Placeholder Agronomy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Strict Non-Slaughter Protocol</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Exportable PDF Reports</span>
                </div>
              </div>
            </div>

            {/* Hero Graphic / Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Agronomic Telemetry</h3>
                      <p className="text-[11px] text-slate-400">Live Soil & Herd Health Analysis</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                    94/100 Optimal
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 bg-stone-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Soil Chemistry Index</span>
                      <span className="text-sm font-bold text-slate-800">Clay Loam (pH 6.8, Med NPK)</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">Balanced</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Livestock Preservation</span>
                      <span className="text-sm font-bold text-slate-800">Biogas + Vermicompost Model</span>
                    </div>
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded">High Margin</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-500 block">Projected Season ROI</span>
                      <span className="text-sm font-bold text-emerald-700">+162% Net Return</span>
                    </div>
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>

                <button
                  onClick={() => setSanctuaryModalOpen(true)}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-200 transition-colors flex items-center justify-center gap-1.5"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Browse 50+ Verified Gaushalas & Sanctuaries</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-serif">100%</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Ethical Preservation Policy</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">30+ Sectors</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Agro-Climatic Zones Mapped</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-serif">&lt; 3.5s</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Gemini Inference Latency</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-serif">Zero</p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Culling or Distress Selling</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars of AgriGenius */}
      <section className="py-16 sm:py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
              Complete Agronomic & Animal Welfare Architecture
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3">
              Engineered for smallholder farmers and commercial managers who refuse to compromise between profitability and compassionate stewardship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Soil-Specific Crop Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Evaluates N-P-K nutrient availability, pH tolerance, drainage physics, and historical rotation to recommend high-yielding crops and regenerative alternatives.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ethical Bovine Preservation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transforms non-milking, elderly, or rescued cattle from financial liabilities into economic assets via vermicompost, domestic biogas energy, and sanctuary networks.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Financial Modeling & PDF Plans</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Transparent break-even forecasts, cost-per-acre simulations, and audit-ready PDF export packs designed for bank loan reviews and farm certification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sustainable Monetization Callout */}
      <section className="py-16 bg-gradient-to-br from-emerald-900 via-emerald-850 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Slaughter-Free Agronomic Economics
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold mt-2 mb-4 leading-tight">
                Cattle Preservation Through High-Margin Bio-Products
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
                When cattle are retired or milking yield declines, distress selling is never the only option. AgriGenius designs turn-key biological workflows:
              </p>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-800 text-emerald-200 mt-1">
                    <Recycle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Premium Vermicompost & Vermiwash</h4>
                    <p className="text-xs text-slate-300">Produce 100% organic nitrogen-rich fertilizer from herd manure, generating monthly revenues.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-800 text-amber-200 mt-1">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Farmstead Methane & Biogas Digestion</h4>
                    <p className="text-xs text-slate-300">Offset 100% of kitchen cooking gas costs and generate nutrient-loaded liquid slurry.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-teal-800 text-teal-200 mt-1">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white">Gaushala & Sanctuary Relocation Protocol</h4>
                    <p className="text-xs text-slate-300">Direct integration with accredited shelters offering compassionate lifetime care.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-800/40 border border-emerald-700/50 rounded-3xl p-8 backdrop-blur-md">
              <h3 className="text-xl font-bold mb-3">Begin Your First Advisory Assessment</h3>
              <p className="text-xs text-emerald-100/90 leading-relaxed mb-6">
                Receive an immediate, scientifically verified agronomic report customized for your exact field acreage and herd profile.
              </p>
              <div className="space-y-3">
                <Link
                  to={user ? "/advisory/new-crop" : "/auth/register"}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md transition-colors"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Start Crop Advisory Form</span>
                </Link>
                <Link
                  to={user ? "/advisory/livestock-care" : "/auth/register"}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm transition-colors"
                >
                  <HeartHandshake className="w-4 h-4 text-amber-600" />
                  <span>Start Cattle Welfare Advisory</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <Sprout className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold font-serif text-white">AgriGenius</span>
          </div>

          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={() => setSanctuaryModalOpen(true)}
              className="hover:text-emerald-400 transition-colors"
            >
              Gaushala Directory
            </button>
            <Link to="/auth/login" className="hover:text-emerald-400 transition-colors">
              Sign In
            </Link>
            <Link to="/auth/register" className="hover:text-emerald-400 transition-colors">
              Register Farm
            </Link>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 AgriGenius Agronomy Systems. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Directory Modal */}
      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
      />
    </div>
  );
};
