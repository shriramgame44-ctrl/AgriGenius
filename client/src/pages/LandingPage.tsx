import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../api/auth.api";
import { useAgri } from "../context/AgriContext";
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
  Camera,
  ShoppingCart,
  Satellite,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const { language, t } = useAgri();
  const [sanctuaryModalOpen, setSanctuaryModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200/60 bg-gradient-to-b from-emerald-50/40 via-stone-50 to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  {language === "hi"
                    ? "गूगल जेमिनी 2.0 AI व सैटेलाइट तकनीक द्वारा संचालित"
                    : language === "mr"
                    ? "गुगल जेमिनी 2.0 AI व उपग्रह तंत्रज्ञानावर आधारित"
                    : "Powered by Google Gemini 2.0 AI & Satellite Telemetry"}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                {language === "hi" ? (
                  <>
                    स्मार्ट डिजिटल खेती, <br className="hidden sm:inline" />
                    <span className="text-emerald-700 italic">सटीक नपाई व गोवंश संरक्षण</span>
                  </>
                ) : language === "mr" ? (
                  <>
                    स्मार्ट डिजिटल शेती, <br className="hidden sm:inline" />
                    <span className="text-emerald-700 italic">अचूक मोजणी व गोवंश संवर्धन</span>
                  </>
                ) : (
                  <>
                    Data-Driven Precision Agronomy & <br className="hidden sm:inline" />
                    <span className="text-emerald-700 italic">Smart Farm Management</span>
                  </>
                )}
              </h1>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {language === "hi"
                  ? "सैटेलाइट से खेत का क्षेत्रफल मापें, पत्ती की फोटो से रोग पहचानें, सरकारी सब्सिडी वाली खाद मंगवाएं और थोक खरीदारों से सीधे इंस्टाग्राम शैली में बात करें।"
                  : language === "mr"
                  ? "उपग्रहावरून शेताचे क्षेत्रफळ मोजा, पानाच्या फोटोवरून रोग ओळखा, अनुदानित खते मागवा आणि थेट व्यापाऱ्यांशी इन्स्टाग्रामप्रमाणे चर्चा करा."
                  : "Measure field perimeters from satellite, diagnose leaf diseases with AI, buy subsidized fertilizers with smart dosage calculator, and negotiate produce with buyers in real-time."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-700/25 transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  <Sprout className="w-5 h-5 text-emerald-200" />
                  <span>
                    {language === "hi"
                      ? "किसान ऐप खोलें (कमांड सेंटर)"
                      : language === "mr"
                      ? "शेतकरी ॲप उघडा (कमांड सेंटर)"
                      : "Enter Farmer Command Center"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/fields"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-stone-100 text-slate-800 font-bold text-sm sm:text-base border border-stone-200 shadow-sm transition-all cursor-pointer"
                >
                  <Satellite className="w-5 h-5 text-emerald-600" />
                  <span>
                    {language === "hi"
                      ? "सैटेलाइट से खेत नापें"
                      : language === "mr"
                      ? "उपग्रहावरून शेत मोजा"
                      : "Measure Land from Satellite"}
                  </span>
                </Link>
              </div>

              {/* Quick Feature Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === "hi" ? "ऑफ़लाइन काम करता है" : language === "mr" ? "ऑफलाइन चालते" : "Offline-First Support"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === "hi" ? "वाणी व आवाज़ सहायता" : language === "mr" ? "आवाज साहाय्य" : "Voice-to-Text Input"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{language === "hi" ? "सीधा खरीदार मोलभाव" : language === "mr" ? "थेट व्यापारी संवाद" : "Direct Buyer Negotiation"}</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-emerald-50 rounded-xl text-emerald-700">
                      <Leaf className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        {language === "hi" ? "कृषि टेलीमेट्री लाइव" : language === "mr" ? "कृषी टेलीमेट्री थेट" : "Live Agronomy Telemetry"}
                      </h3>
                      <p className="text-[11px] text-slate-400">Rampur Farm • 4.2 Acres</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                    🟢 Live
                  </span>
                </div>

                <div className="space-y-2.5">
                  <Link
                    to="/scanner"
                    className="p-3 bg-stone-50 hover:bg-emerald-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Camera className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {t("ai_crop_scanner")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === "hi" ? "पत्ती स्कैन कर तुरंत उपचार पाएं" : "Leaf diagnosis with 1-tap cure"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/fields"
                    className="p-3 bg-stone-50 hover:bg-emerald-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Satellite className="w-4 h-4 text-teal-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {t("farm_mapping")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === "hi" ? "4.2 एकड़ • तारबंदी: 820 मीटर" : "4.2 Acres • Perimeter: 820m"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link
                    to="/store"
                    className="p-3 bg-stone-50 hover:bg-emerald-50 rounded-2xl border border-stone-200/80 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">
                          {t("buy_fertilizers")}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {language === "hi" ? "सब्सिडी यूरिया ₹225 • डीएपी ₹1,350" : "Nano Urea ₹225 • DAP ₹1,350"}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </div>

                <div className="pt-2">
                  <Link
                    to="/dashboard"
                    className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <span>{t("command_center")} →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Pillars Grid */}
      <section className="py-16 sm:py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              {language === "hi"
                ? "ग्रामीण किसानों के लिए संपूर्ण डिजिटल समाधान"
                : language === "mr"
                ? "ग्रामीण शेतकऱ्यांसाठी संपूर्ण डिजिटल सोयी"
                : "Comprehensive Digital Agriculture Platform"}
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              {language === "hi"
                ? "कमजोर नेटवर्क और धूप में भी आसानी से चलने वाले बड़े बटनों और बहुभाषी आवाज़ के साथ।"
                : "Engineered specifically for low-connectivity rural environments and outdoor sunlight readability."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{t("ai_crop_scanner")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("scanner_card_desc")}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
                <Satellite className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{t("farm_mapping")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("satellite_measuring_desc")}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{t("buy_fertilizers")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("store_card_desc")}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-stone-50 border border-stone-200/80 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900">{t("sell_produce")}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t("market_card_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-xs">
        <p>© 2026 AgriGenius Smart Agriculture Systems. All rights reserved.</p>
      </footer>

      <SanctuaryDirectoryModal
        isOpen={sanctuaryModalOpen}
        onClose={() => setSanctuaryModalOpen(false)}
      />
    </div>
  );
};
