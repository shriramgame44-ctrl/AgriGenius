import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";
import { EconomicForecast } from "../types";

interface EconomicBarChartProps {
  forecast: EconomicForecast;
}

export const EconomicBarChart: React.FC<EconomicBarChartProps> = ({ forecast }) => {
  const data = [
    {
      name: "Estimated Cost",
      amount: forecast.estimatedCostPerUnitArea,
      color: "#94A3B8", // Slate
    },
    {
      name: "Net Return",
      amount: forecast.estimatedNetReturn,
      color: "#10B981", // Emerald
    },
  ];

  const roi =
    forecast.estimatedCostPerUnitArea > 0
      ? Math.round((forecast.estimatedNetReturn / forecast.estimatedCostPerUnitArea) * 100)
      : 0;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Economic Forecast & ROI</h3>
            <p className="text-xs text-slate-500">Projected costs vs net returns and break-even milestones</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" />
            ROI: +{roi}%
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <Calendar className="w-3.5 h-3.5" />
            {forecast.breakEvenTimelineMonths} mo. break-even
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis dataKey="name" tick={{ fill: "#64748B", fontSize: 12, fontWeight: 500 }} />
            <YAxis
              tick={{ fill: "#64748B", fontSize: 12 }}
              tickFormatter={(val) => `$${val.toLocaleString()}`}
            />
            <Tooltip
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Amount"]}
              contentStyle={{
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                borderRadius: "10px",
                border: "none",
                fontSize: "12px",
              }}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-100 text-center">
        <div className="p-2.5 bg-slate-50 rounded-xl">
          <span className="text-xs text-slate-500 block">Total Projected Yield</span>
          <span className="text-sm font-bold text-slate-800">{forecast.projectedYieldPerUnitArea}</span>
        </div>
        <div className="p-2.5 bg-emerald-50 rounded-xl">
          <span className="text-xs text-emerald-700 block">Estimated Net Profit</span>
          <span className="text-sm font-bold text-emerald-900">${forecast.estimatedNetReturn.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
