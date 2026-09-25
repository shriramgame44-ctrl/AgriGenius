import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCreateLivestockAdvisory } from "../api/advisory.api";
import {
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  AlertCircle,
  Flame,
  Recycle,
  CheckCircle,
  Home,
  Activity,
} from "lucide-react";

const FormSchema = z.object({
  bovineCategory: z.string().min(2, "Bovine category is required"),
  headCount: z.coerce.number().int().positive("Must specify at least 1 animal"),
  ageDistribution: z.string().min(2, "Age distribution is required"),
  healthStatus: z.string().min(5, "Health status description required"),
  feedResources: z.string().min(5, "Feed resources description required"),
  shelterType: z.string().min(2, "Shelter type is required"),
  distressFactors: z.string().min(2, "Distress factors are required"),
  primaryObjective: z.string().min(2, "Primary objective is required"),
});

type FormData = z.infer<typeof FormSchema>;

export const LivestockWelfareWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateLivestockAdvisory();

  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      bovineCategory: "Indigenous / Heritage Breed (Desi Cow)",
      headCount: 4,
      ageDistribution: "2 cows (4-6 yrs), 1 elderly cow (11 yrs), 1 calf (8 mos)",
      healthStatus: "Moderate body condition score (2.5/5), mild stiffness in hind legs of senior cow, negative for mastitis",
      feedResources: "Paddy straw dry fodder with limited seasonal green grass, high cost of commercial cattle concentrate",
      shelterType: "Semi-open shed with corrugated tin roof and uneven stone floor",
      distressFactors: "Fodder price inflation and declining milk yields causing monthly cash flow deficits",
      primaryObjective: "Preserve herd with slaughter prevention: Vermicompost + Biogas Monetization & Ethno-Vet Care",
    },
  });

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = [];
    if (step === 1) {
      fieldsToValidate = ["bovineCategory", "headCount", "ageDistribution"];
    } else if (step === 2) {
      fieldsToValidate = ["healthStatus", "feedResources", "shelterType"];
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
    } catch (err) {
      console.error("Livestock advisory error:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Wizard Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
        <div className="flex items-center space-x-3 mb-2">
          <div className="p-2.5 bg-amber-50 rounded-2xl text-amber-700">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Cattle & Livestock Welfare Advisory Wizard
            </h1>
            <p className="text-xs text-slate-500">
              Ethical husbandry, humane rehabilitation, slaughter-prevention economics & sanctuary integration
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>
              Step {step} of {totalSteps}:{" "}
              {step === 1
                ? "Herd Profile & Composition"
                : step === 2
                ? "Health, Feed & Shelter Infrastructure"
                : "Distress Factors & Preservation Goals"}
            </span>
            <span className="font-bold text-amber-700">{Math.round((step / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-600 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {createMutation.isError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Generation Failed</p>
            <p>{(createMutation.error as any)?.message || "Failed to generate welfare blueprint. Please try again."}</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {createMutation.isPending ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xl text-center space-y-6 animate-pulse">
          <div className="w-16 h-16 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              Formulating Cattle Welfare & Preservation Plan...
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Analyzing herd nutritional deficit curves, local ethno-veterinary botanicals, biogas digestate economics, and accredited Gaushala rescue networks.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Ethical Non-Slaughter Protocol Strictly Enforced</span>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          {/* STEP 1: Herd Profile & Composition */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Bovine Herd Profile & Head Count</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Bovine Category / Breed Group *
                </label>
                <select
                  {...register("bovineCategory")}
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                >
                  <option value="Indigenous / Heritage Breed (Desi Cow)">
                    Indigenous / Heritage Breed (Gir, Sahiwal, Rathi, Tharparkar, Ongole)
                  </option>
                  <option value="Crossbred Dairy Bovines (HF / Jersey Cross)">
                    Crossbred Dairy Bovines (HF / Jersey Cross)
                  </option>
                  <option value="Retired / Elderly Non-Milking Cows">
                    Retired / Elderly Non-Milking Cows
                  </option>
                  <option value="Dairy Buffalo (Murrah / Mehsana)">
                    Dairy Buffalo (Murrah / Mehsana)
                  </option>
                  <option value="Working Bullocks / Castrated Males">
                    Working Bullocks / Draft Oxen
                  </option>
                  <option value="Rescued / Abandoned / Orphaned Calves">
                    Rescued / Abandoned / Orphaned Calves
                  </option>
                </select>
                {errors.bovineCategory && (
                  <p className="text-xs text-rose-600 mt-1">{errors.bovineCategory.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Herd Count (Number of Bovines) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    {...register("headCount")}
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.headCount && (
                    <p className="text-xs text-rose-600 mt-1">{errors.headCount.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Age Distribution & Demographics *
                  </label>
                  <input
                    type="text"
                    {...register("ageDistribution")}
                    placeholder="e.g. 2 adult cows (5 yrs), 1 senior (12 yrs)"
                    className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  {errors.ageDistribution && (
                    <p className="text-xs text-rose-600 mt-1">{errors.ageDistribution.message}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Health, Feed & Shelter */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span>Physical Health Markers & Shelter Environment</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Health & Nutritional Condition *
                </label>
                <textarea
                  rows={2}
                  {...register("healthStatus")}
                  placeholder="Detail body condition (emaciated / normal), lameness, joint arthritis, respiratory status, or past illness..."
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {errors.healthStatus && (
                  <p className="text-xs text-rose-600 mt-1">{errors.healthStatus.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Available Feed & Water Resources *
                </label>
                <textarea
                  rows={2}
                  {...register("feedResources")}
                  placeholder="Describe dry fodder reserves (straw/hay), green fodder availability, access to grazing land, and daily water source..."
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {errors.feedResources && (
                  <p className="text-xs text-rose-600 mt-1">{errors.feedResources.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Shelter & Housing Type *
                </label>
                <input
                  type="text"
                  {...register("shelterType")}
                  placeholder="e.g. Open kraal with tin roof, muddy dirt floor, 200 sq ft space"
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {errors.shelterType && (
                  <p className="text-xs text-rose-600 mt-1">{errors.shelterType.message}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Distress & Preservation Goals */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                <span>Distress Factors & Sustainable Preservation Goals</span>
              </h2>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Distress Factors & Economic Pressure Points *
                </label>
                <textarea
                  rows={2}
                  {...register("distressFactors")}
                  placeholder="e.g. High feed costs, dry season water scarcity, milk cessation, veterinary expenses, family financial stress..."
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                {errors.distressFactors && (
                  <p className="text-xs text-rose-600 mt-1">{errors.distressFactors.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Primary Objective / Preservation Pathway *
                </label>
                <select
                  {...register("primaryObjective")}
                  className="w-full px-4 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700"
                >
                  <option value="Preserve herd on-farm with Bio-Product Monetization (Vermicompost & Biogas)">
                    Preserve herd on-farm with Bio-Product Monetization (Vermicompost & Biogas)
                  </option>
                  <option value="Establish Ethno-Veterinary Low-Cost Healthcare & Ration Balancing">
                    Establish Ethno-Veterinary Low-Cost Healthcare & Ration Balancing
                  </option>
                  <option value="Compassionate Relocation to Accredited Gaushala / Sanctuary">
                    Compassionate Relocation to Accredited Gaushala / Sanctuary
                  </option>
                  <option value="Transition to Value-Added Natural Dairy & Panchagavya Production">
                    Transition to Value-Added Natural Dairy & Panchagavya Production
                  </option>
                </select>
              </div>

              {/* Ethical notice */}
              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 text-xs text-amber-950 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Preservation Guarantee
                </p>
                <p>
                  AgriGenius never advocates culling or distress sales. All recommendations focus on financial viability, humane husbandry, and life-affirming care for your bovine companions.
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
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Generate Welfare Blueprint</span>
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
