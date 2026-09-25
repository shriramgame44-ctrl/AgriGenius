import React, { useState } from "react";
import { useAuth } from "../api/auth.api";
import {
  Settings,
  Building,
  MapPin,
  User,
  Scale,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || "");
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [locationRegion, setLocationRegion] = useState(user?.locationRegion || "Punjab");
  const [preferredUnits, setPreferredUnits] = useState<"METRIC" | "IMPERIAL">(
    user?.preferredUnits || "METRIC"
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const regions = [
    "Punjab",
    "Haryana",
    "Rajasthan",
    "Gujarat",
    "Maharashtra",
    "Karnataka",
    "Tamil Nadu",
    "Uttar Pradesh",
    "Madhya Pradesh",
    "Andhra Pradesh",
    "California / Central Valley",
    "Midwest / Corn Belt",
    "Other / Global",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      await updateProfile({
        fullName,
        farmName,
        locationRegion,
        preferredUnits,
      });
      setSuccessMessage("Farm profile and agronomic preferences updated successfully.");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-700">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
            Account & Farm Profile
          </h1>
          <p className="text-xs text-slate-500">
            Configure default unit systems, regional climate parameters, and farm identity
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Farm Name / Enterprise Label
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              placeholder="e.g. Green Valley Bio-Farms"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Primary Agricultural Region / Climate Zone
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <select
              value={locationRegion}
              onChange={(e) => setLocationRegion(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            >
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Preferred Measurement & Agronomic Units</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => setPreferredUnits("METRIC")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                preferredUnits === "METRIC"
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Metric System</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">
                Land in Hectares, crop yield in Metric Tons / Kilograms, water in liters / mm.
              </p>
            </div>

            <div
              onClick={() => setPreferredUnits("IMPERIAL")}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                preferredUnits === "IMPERIAL"
                  ? "bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20"
                  : "bg-slate-50 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900">Imperial System</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">
                Land in Acres, crop yield in Bushels / Pounds, water in gallons / inches.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
