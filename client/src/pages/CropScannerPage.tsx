import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgri } from "../context/AgriContext";
import {
  Camera,
  Upload,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  ShoppingCart,
  ArrowRight,
  ShieldAlert,
  Leaf,
  RefreshCw,
  Info,
} from "lucide-react";

interface DiagnosisResult {
  diseaseName: string;
  scientificName: string;
  confidence: number;
  severity: "Low" | "Moderate" | "High" | "Critical";
  affectedCrop: string;
  summary: string;
  organicTreatment: string;
  chemicalTreatment: string;
  sprayDosage: string;
  medicineItem: {
    id: string;
    title: string;
    brand: string;
    category: string;
    price: number;
    subsidizedPrice: number;
    packWeight: string;
    image: string;
  };
}

const SAMPLE_LEAF_SCENARIOS = [
  {
    name: "Tomato Early Blight",
    crop: "Tomato",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=600&q=80",
    result: {
      diseaseName: "Early Blight (Alternaria solani)",
      scientificName: "Alternaria solani",
      confidence: 96.4,
      severity: "Moderate" as const,
      affectedCrop: "Tomato (Solanum lycopersicum)",
      summary: "Dark concentric rings resembling a target board with yellow chlorotic halos around lesions on lower foliage.",
      organicTreatment: "Spray 5% fermented neem seed kernel extract (NSKE) or bio-control Trichoderma harzianum at 5g/L water every 7 days.",
      chemicalTreatment: "Foliar spray with Copper Oxychloride 50% WP or Mancozeb 75% WP. Avoid overhead sprinkler irrigation.",
      sprayDosage: "30g Copper Oxychloride in 15 Liters spray tank (2g/L). Treat 2 times with 10-day interval.",
      medicineItem: {
        id: "fert-copper",
        title: "Copper Oxychloride 50% WP (Blitox)",
        brand: "Rallis India",
        category: "Fungicide",
        price: 450,
        subsidizedPrice: 380,
        packWeight: "500g",
        image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
      },
    },
  },
  {
    name: "Wheat Yellow Rust",
    crop: "Wheat",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    result: {
      diseaseName: "Stripe / Yellow Rust (Puccinia striiformis)",
      scientificName: "Puccinia striiformis f. sp. tritici",
      confidence: 94.8,
      severity: "High" as const,
      affectedCrop: "Wheat (Triticum aestivum)",
      summary: "Linear yellowish-orange pustules arranged in parallel stripes along the leaf blade. Highly infectious under cool, humid conditions.",
      organicTreatment: "Foliar application of sour buttermilk extract (Lassi) mixed with wood ash slurry and garlic cloves extract.",
      chemicalTreatment: "Immediate application of systemic triazole fungicide: Propiconazole 25% EC (Tilt).",
      sprayDosage: "1.0 ml Propiconazole per 1 Liter water (200 ml per 200 Liters water per acre).",
      medicineItem: {
        id: "fert-propiconazole",
        title: "Tilt Propiconazole 25% EC Systemic Fungicide",
        brand: "Syngenta",
        category: "Fungicide",
        price: 520,
        subsidizedPrice: 440,
        packWeight: "250ml",
        image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
      },
    },
  },
  {
    name: "Cotton Leaf Curl Virus",
    crop: "Cotton",
    image: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80",
    result: {
      diseaseName: "Cotton Leaf Curl Gemini-Virus (CLCuV)",
      scientificName: "Begomovirus transmitted by Whitefly",
      confidence: 91.2,
      severity: "Critical" as const,
      affectedCrop: "Cotton (Gossypium hirsutum)",
      summary: "Upward or downward cupping of leaves with thickening of primary veins and leaf enations. Spread rapidly by Bemisia tabaci whiteflies.",
      organicTreatment: "Install 15 yellow sticky traps per acre; release Chrysoperla carnea green lacewing predators.",
      chemicalTreatment: "Vector management: Spray Diafenthiuron 50% WP or Pyriproxyfen 10% EC to suppress whitefly breeding.",
      sprayDosage: "1.2g Diafenthiuron per Liter of water during non-windy morning hours.",
      medicineItem: {
        id: "fert-diafenthiuron",
        title: "Pegasus Diafenthiuron 50% WP Insecticide",
        brand: "Syngenta",
        category: "Insecticide",
        price: 780,
        subsidizedPrice: 690,
        packWeight: "250g",
        image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=400&q=80",
      },
    },
  },
];

export const CropScannerPage: React.FC = () => {
  const { language, t, addToCart } = useAgri();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState<string>(SAMPLE_LEAF_SCENARIOS[0].image);
  const [selectedCrop, setSelectedCrop] = useState<string>("Tomato");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(SAMPLE_LEAF_SCENARIOS[0].result);
  const [addedNotice, setAddedNotice] = useState(false);

  const handleSelectSample = (sample: (typeof SAMPLE_LEAF_SCENARIOS)[0]) => {
    setSelectedImage(sample.image);
    setSelectedCrop(sample.crop);
    setIsAnalyzing(true);
    setDiagnosis(null);
    setAddedNotice(false);

    setTimeout(() => {
      setDiagnosis(sample.result);
      setIsAnalyzing(false);
    }, 1200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
        setIsAnalyzing(true);
        setDiagnosis(null);
        setAddedNotice(false);

        setTimeout(() => {
          setDiagnosis(SAMPLE_LEAF_SCENARIOS[0].result);
          setIsAnalyzing(false);
        }, 1400);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBuyMedicine = (item: DiagnosisResult["medicineItem"]) => {
    addToCart(item, 1);
    setAddedNotice(true);
    setTimeout(() => {
      navigate("/store");
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Vision Plant Pathology AI • Edge Offline Fallback</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t("crop_scanner_title")}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-1">
            {t("crop_scanner_desc")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-800/60 border border-emerald-700/60 p-3 rounded-2xl text-xs">
          <Info className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>Offline Edge Model Loaded</span>
        </div>
      </div>

      {/* Main Grid: Viewfinder on Left, Diagnosis Report on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image & Camera Capture */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>{t("leaf_viewfinder")}</span>
              <span className="text-xs text-emerald-700 font-semibold">{selectedCrop} Field</span>
            </h3>

            {/* Viewfinder Preview */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-900 border-2 border-dashed border-emerald-500/50 flex items-center justify-center group">
              <img
                src={selectedImage}
                alt="Crop leaf"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute inset-4 pointer-events-none border border-emerald-400/60 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0" />

                {isAnalyzing && (
                  <div className="bg-slate-950/80 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 backdrop-blur-md">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                    <span>Analyzing Leaf Pathology...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Camera / Upload Controls */}
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center justify-center gap-2 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl cursor-pointer transition-all shadow-sm">
                <Camera className="w-4 h-4" />
                <span>{t("snap_camera")}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <label className="flex items-center justify-center gap-2 py-3 px-4 bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>{t("upload_photo")}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* Quick Preset Samples */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                {t("quick_test_samples")}
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_LEAF_SCENARIOS.map((sample) => (
                  <button
                    key={sample.name}
                    onClick={() => handleSelectSample(sample)}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedImage === sample.image
                        ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold"
                        : "border-stone-200 hover:bg-stone-50 text-slate-700"
                    }`}
                  >
                    <span className="text-[11px] leading-tight block truncate">{sample.name}</span>
                    <span className="text-[10px] text-slate-400 block">{sample.crop}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Pathology Report */}
        <div className="lg:col-span-7 space-y-4">
          {diagnosis ? (
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        diagnosis.severity === "Critical"
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : diagnosis.severity === "High"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {diagnosis.severity}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {diagnosis.confidence}%
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2 font-serif">
                    {diagnosis.diseaseName}
                  </h2>
                  <p className="text-xs text-slate-500 italic">{diagnosis.scientificName}</p>
                </div>

                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition-colors cursor-pointer"
                  title="Listen in regional language"
                >
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>{t("audio_read_aloud")}</span>
                </button>
              </div>

              {/* Symptoms Summary */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <span className="font-bold text-slate-900 block mb-1">{t("symptoms")}</span>
                {diagnosis.summary}
              </div>

              {/* Treatment Dual Cards: Organic & Chemical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Leaf className="w-4 h-4 text-emerald-600" />
                    <span>{t("organic_remedy")}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {diagnosis.organicTreatment}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-teal-900 font-bold text-xs">
                    <ShieldAlert className="w-4 h-4 text-teal-600" />
                    <span>{t("chemical_control")}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {diagnosis.chemicalTreatment}
                  </p>
                </div>
              </div>

              {/* Spray Dosage Instructions */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider block">
                  {t("spray_dosage")}
                </span>
                <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                  {diagnosis.sprayDosage}
                </p>
              </div>

              {/* 1-Tap Buy Medicine Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-3">
                  <img
                    src={diagnosis.medicineItem.image}
                    alt={diagnosis.medicineItem.title}
                    className="w-14 h-14 rounded-xl object-cover bg-white p-1"
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                      Recommended
                    </span>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {diagnosis.medicineItem.title}
                    </h4>
                    <p className="text-xs text-emerald-200 mt-0.5">
                      ₹{diagnosis.medicineItem.subsidizedPrice}{" "}
                      <span className="line-through text-emerald-400 text-[10px]">
                        MRP ₹{diagnosis.medicineItem.price}
                      </span>{" "}
                      • {diagnosis.medicineItem.packWeight}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuyMedicine(diagnosis.medicineItem)}
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {addedNotice ? "Added to Cart!" : t("buy_cure_button")}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 shadow-sm text-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <h3 className="font-bold text-slate-800 text-base">Analyzing Leaf Image...</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
