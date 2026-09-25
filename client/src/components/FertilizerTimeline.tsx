import React from "react";
import { FertilizerScheduleItem } from "../types";
import { Sprout, Leaf, Sparkles, Clock } from "lucide-react";

interface FertilizerTimelineProps {
  schedule: FertilizerScheduleItem[];
}

export const FertilizerTimeline: React.FC<FertilizerTimelineProps> = ({ schedule }) => {
  const getStageIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Sprout className="w-5 h-5 text-emerald-600" />;
      case 1:
        return <Leaf className="w-5 h-5 text-emerald-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center space-x-2.5 mb-6">
        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Crop Fertilization & Nutrition Timeline</h3>
          <p className="text-xs text-slate-500">Phased nutrient applications paired with organic regenerative alternatives</p>
        </div>
      </div>

      <div className="relative pl-6 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-emerald-300 before:to-emerald-100">
        {schedule.map((item, index) => (
          <div key={index} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-0 flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 border-emerald-500 shadow-sm group-hover:scale-110 transition-transform">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
            </div>

            <div className="bg-stone-50 rounded-xl p-4 border border-stone-200/80 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100/70 text-emerald-800">
                  {getStageIcon(index)}
                  {item.growthStage}
                </span>
                <span className="text-xs font-medium text-slate-400">Phase {index + 1}</span>
              </div>

              <div className="space-y-2 mt-3 text-sm">
                <div className="p-2.5 bg-white rounded-lg border border-slate-100">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                    Nutrient Application:
                  </span>
                  <p className="text-slate-800 font-medium text-xs sm:text-sm">{item.nutrientApplication}</p>
                </div>

                <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-100">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Regenerative / Organic Alternative:
                  </span>
                  <p className="text-emerald-900 text-xs sm:text-sm font-medium">{item.organicAlternative}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
