import React, { useState } from "react";
import { downloadPdfReport } from "../api/advisory.api";
import { FileDown, Loader2, Check } from "lucide-react";

interface PdfExportButtonProps {
  advisoryId: string;
  title: string;
  variant?: "primary" | "secondary";
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  advisoryId,
  title,
  variant = "primary",
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDownload = async () => {
    try {
      setIsExporting(true);
      await downloadPdfReport(advisoryId, title);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      console.error("PDF download error:", err);
      alert("Failed to export PDF report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const baseClasses =
    "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-60 cursor-pointer";

  const variantClasses =
    variant === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-emerald-700/20"
      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50";

  return (
    <button
      onClick={handleDownload}
      disabled={isExporting}
      className={`${baseClasses} ${variantClasses}`}
      title="Download official PDF agronomic advisory report"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
          <span>Generating PDF...</span>
        </>
      ) : isSuccess ? (
        <>
          <Check className="w-4 h-4 text-emerald-300" />
          <span>Report Downloaded!</span>
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4" />
          <span>Download PDF Report</span>
        </>
      )}
    </button>
  );
};
