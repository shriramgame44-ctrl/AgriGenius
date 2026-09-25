import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateCropAdvisory } from "../api/advisory.api";
import { useAuth } from "../api/auth.api";
import {
  Sprout,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Compass,
  Droplet,
  DollarSign,
} from "lucide-react";

const FormSchema = z.object({
  region: z.string().min(2, "State or region is required"),
  plotSize: z.coerce.number().positive("Plot size must be greater than 0"),
  units: z.enum(["ACRES", "HECTARES"]),
  soilType: z.string().min(2, "Soil type is required"),
  soilPh: z.coerce.number().min(3.0, "pH must be >= 3.0").max(10.0, "pH must be <= 10.0"),
  nitrogen: z.enum(["LOW", "MEDIUM", "HIGH"]),
  phosphorus: z.enum(["LOW", "MEDIUM", "HIGH"]),
  potassium: z.enum(["LOW", "MEDIUM", "HIGH"]),
  irrigationType: z.string().min(2, "Irrigation type is required"),
  season: z.string().min(2, "Season is required"),
  previousCrop: z.string().min(2, "Previous crop details required"),
  budget: z.coerce.number().nonnegative("Budget must be 0 or positive"),
});

type FormData = z.infer<typeof FormSchema>;

export const CropAdvisoryWizardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const createMutation = useCreateCropAdvisory();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      region: user?.locationRegion || "Punjab",
      plotSize: 5,
      units: (user?.preferredUnits === "IMPERIAL" ? "ACRES" : "HECTARES") as "ACRES" | "HECTARES",
      soilType: "Clay Loam",
      soilPh: 6.8,
      nitrogen: "MEDIUM",
      phosphorus: "MEDIUM",
      potassium: "HIGH",
      irrigationType: "Drip Irrigation",
      season: "Kharif (Monsoon)",
      previousCrop: "Wheat (Average Yield)",
      budget: 15000,
    },
  });

  const soilPhValue = watch("soilPh");

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ["region", "plotSize", "units", "season"];
    } else if (step === 2) {
      fieldsToValidate = ["soilType", "soilPh", "nitrogen", "phosphorus", "potassium", "irrigationType"];
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep((s) => Math.min(totalSteps, s + 1));
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await createMutation.mutateAsync(data);
      if (res?.id) {
        navigate(`/advisory/results/${res.id}`);
      }
    } catch (err: any) {
      console.error("Crop advisory submission error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-700">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Multi-Factor Crop Advisory Wizard
            </h1>
            <p className="text-xs text-slate-500">
              Input field telemetry to compute scientific crop selection, fertilization, and yield schedules
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>
              Step {step} of {totalSteps}:{" "}
              {step === 1
                ? "Geographical & Plot Parameters"
                : step === 2
                ? "Soil Chemistry & Irrigation"
                : "History, Rotation & Budget"}
            </span>
            <span className="font-bold text-emerald-700">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {createMutation.isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Advisory Generation Error</p>
            <p>{(createMutation.error as any)?.message || "Failed to generate plan. Please try again."}</p>
          </div>
        </div>
      )}

      {/* Loading Overlay with Simulated Agronomic Telemetry */}
      {createMutation.isPending ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              Gemini 2.5 Flash Computing Agronomic Plan...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Synthesizing soil chemistry parameters, agro-climatic seasonal variables, pest vector risk, and financial break-even projections.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Enforcing Strict Zod JSON Schema</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          {/* STEP 1: Geographical & Plot Profile */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-600" />
                <span>Geographical Region & Target Planting Window</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Region / State *
                  </label>
                  <input
                    type="text"
                    {...register("region")}
                    placeholder="e.g. Punjab, Rajasthan, California"
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.region && <p className="text-xs text-rose-600 mt-1">{errors.region.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Target Planting Season *
                  </label>
                  <select
                    {...register("season")}
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  >
                    <option value="Kharif (Monsoon)">Kharif (Monsoon / Summer)</option>
                    <option value="Rabi (Winter)">Rabi (Winter)</option>
                    <option value="Zaid (Pre-Monsoon / Spring)">Zaid (Pre-Monsoon / Spring)</option>
                    <option value="Year-Round / Perennial">Year-Round / Perennial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Plot Size *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...register("plotSize")}
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {errors.plotSize && <p className="text-xs text-rose-600 mt-1">{errors.plotSize.message}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Measurement Units
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setValue("units", "ACRES")}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        watch("units") === "ACRES"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Acres
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue("units", "HECTARES")}
                      className={`py-2 text-xs font-bold rounded-xl border text-center ${
                        watch("units") === "HECTARES"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-500/20"
                          : "bg-slate-50 text-slate-600 border-slate-200"
                      }`}
                    >
                      Hectares
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Soil Chemistry & Irrigation */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Droplet className="w-4 h-4 text-emerald-600" />
                <span>Soil Physical & Chemical Properties</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Soil Texture / Type *
                  </label>
                  <select
                    {...register("soilType")}
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  >
                    <option value="Clay Loam">Clay Loam (High Moisture Retention)</option>
                    <option value="Sandy Loam">Sandy Loam (Rapid Drainage)</option>
                    <option value="Black Cotton Soil">Black Cotton Soil (Deep cracking clay)</option>
                    <option value="Alluvial Silt">Alluvial Silt (High Natural Fertility)</option>
                    <option value="Red Sandy Soil">Red Sandy Soil (Needs Organic Matter)</option>
                    <option value="Peaty / Humic">Peaty / Humic (Acidic Organic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Irrigation System *
                  </label>
                  <select
                    {...register("irrigationType")}
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
                  >
                    <option value="Drip Irrigation">Drip Irrigation (Precision & Fertigation)</option>
                    <option value="Sprinkler Irrigation">Sprinkler System</option>
                    <option value="Canal / Flood Furrow">Canal / Surface Furrow</option>
                    <option value="Rainfed (Non-Irrigated)">Rainfed (Dryland / Rain-dependent)</option>
                  </select>
                </div>
              </div>

              {/* pH Range Slider */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Soil pH Level: <span className="text-emerald-700 text-sm">{soilPhValue}</span>
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {soilPhValue < 6.0 ? "Acidic" : soilPhValue > 7.5 ? "Alkaline" : "Neutral / Ideal"}
                  </span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.1"
                  {...register("soilPh")}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>3.0 (Acidic)</span>
                  <span>7.0 (Neutral)</span>
                  <span>10.0 (Alkaline)</span>
                </div>
              </div>

              {/* N-P-K Indicators */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Available N-P-K Profile
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1 font-medium">Nitrogen (N)</span>
                    <select
                      {...register("nitrogen")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block mb-1 font-medium">Phosphorus (P)</span>
                    <select
                      {...register("phosphorus")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-xs text-slate-500 block mb-1 font-medium">Potassium (K)</span>
                    <select
                      {...register("potassium")}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Rotation History & Capital Budget */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Historical Rotation & Capital Budget</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Previous Crop & Yield Outcome *
                </label>
                <input
                  type="text"
                  {...register("previousCrop")}
                  placeholder="e.g., Rice / Paddy (moderate yield with minor blast issue)"
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {errors.previousCrop && (
                  <p className="text-xs text-rose-600 mt-1">{errors.previousCrop.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Working Capital / Budget *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    step="100"
                    {...register("budget")}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Budget for seeds, basal manure, pest interventions, and irrigation power.
                </p>
              </div>

              {/* Review summary box */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-xs text-emerald-950 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Ready to trigger Gemini Agronomic Reasoning
                </p>
                <p>
                  Target: {watch("plotSize")} {watch("units")} in {watch("region")} during {watch("season")}. Soil pH {watch("soilPh")}.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={nextStep}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Generate AI Advisory</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
