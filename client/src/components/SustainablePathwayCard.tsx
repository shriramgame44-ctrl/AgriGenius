import React from "react";
import { SustainableEconomicPathway } from "../types";
import { Flame, Recycle, Sparkles, CheckCircle2, DollarSign } from "lucide-react";

interface SustainablePathwayCardProps {
  pathway: SustainableEconomicPathway;
}

export const SustainablePathwayCard: React.FC<SustainablePathwayCardProps> = ({ pathway }) => {
  const getIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("biogas") || lower.includes("energy")) {
      return <Flame className="w-5 h-5 text-amber-600" />;
    }
    if (lower.includes("compost") || lower.includes("dung") || lower.includes("vermi")) {
      return <Recycle className="w-5 h-5 text-emerald-600" />;
    }
    return <Sparkles className="w-5 h-5 text-emerald-600" />;
  };

  const getDifficultyBadge = (diff: string) => {
    const d = diff.toUpperCase();
    if (d === "LOW") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Low Effort</span>;
    }
    if (d === "MEDIUM") {
      return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Medium Effort</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">Advanced</span>;
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 hover:border-emerald-300 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-50 rounded-xl">
              {getIcon(pathway.pathwayName)}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-snug">{pathway.pathwayName}</h4>
              <div className="mt-1 flex items-center gap-2">
                {getDifficultyBadge(pathway.implementationDifficulty)}
              </div>
            </div>
          </div>
        </div>

        <div className="my-3 p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 flex items-center gap-2 text-emerald-900">
          <DollarSign className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="text-xs font-semibold">
            Projected Impact: <strong className="text-emerald-800">{pathway.projectedMonthlyIncomeOrSavings}</strong>
          </span>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Execution Steps:
          </span>
          <ul className="space-y-2">
            {pathway.actionSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
