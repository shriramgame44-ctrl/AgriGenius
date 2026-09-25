import React from "react";

interface ScoreGuageProps {
  score: number; // 1 to 100
  label: string;
  sublabel?: string;
  size?: number;
}

export const ScoreGuage: React.FC<ScoreGuageProps> = ({
  score,
  label,
  sublabel,
  size = 180,
}) => {
  const safeScore = Math.min(100, Math.max(0, score));
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  let strokeColor = "#10B981"; // Emerald green
  let bgColor = "text-emerald-50";
  let textColor = "text-emerald-700";

  if (safeScore < 60) {
    strokeColor = "#EF4444"; // Red
    bgColor = "text-rose-50";
    textColor = "text-rose-700";
  } else if (safeScore < 80) {
    strokeColor = "#F59E0B"; // Amber
    bgColor = "text-amber-50";
    textColor = "text-amber-700";
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className={`text-4xl font-extrabold tracking-tight ${textColor}`}>
            {safeScore}
          </span>
          <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="text-sm font-bold text-slate-800">{label}</h4>
        {sublabel && <p className="text-xs text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};
