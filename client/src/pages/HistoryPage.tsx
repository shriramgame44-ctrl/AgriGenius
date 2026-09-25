import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAdvisories, useDeleteAdvisory } from "../api/advisory.api";
import { PdfExportButton } from "../components/PdfExportButton";
import {
  History,
  Sprout,
  HeartHandshake,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

export const HistoryPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isFetching } = useAdvisories(page, 10, typeFilter || undefined);
  const deleteMutation = useDeleteAdvisory();

  const advisories = data?.data || [];
  const pagination = data?.pagination;

  // Client-side text filter for instant search responsiveness
  const filteredAdvisories = advisories.filter((adv) => {
    if (!searchTerm.trim()) return true;
    return adv.title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error("Failed to delete advisory:", err);
        alert("Failed to delete advisory.");
      }
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-50 rounded-2xl text-emerald-700">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-slate-900">
              Advisory Archive & History
            </h1>
            <p className="text-xs text-slate-500">
              Review, filter, compare, and download past agronomic models and cattle welfare reports
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/advisory/new-crop"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm"
          >
            <Sprout className="w-4 h-4" />
            <span>New Crop Plan</span>
          </Link>
          <Link
            to="/advisory/livestock-care"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
          >
            <HeartHandshake className="w-4 h-4 text-amber-600" />
            <span>New Cattle Plan</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-7 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search saved advisories by title or crop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-5 flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
          >
            <option value="">All Advisory Types</option>
            <option value="CROP">Crop Science Only</option>
            <option value="LIVESTOCK_WELFARE">Cattle Welfare Only</option>
          </select>
        </div>
      </div>

      {/* Records Table / List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        {isLoading ? (
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-semibold">Loading archive records...</p>
          </div>
        ) : filteredAdvisories.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-700">No Advisory Records Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || typeFilter
                ? "No matching records found for the applied search or filter criteria."
                : "You haven't generated any advisory reports yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAdvisories.map((adv) => {
              const isCrop = adv.advisory_type === "CROP";
              const dateStr = new Date(adv.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              });

              return (
                <div
                  key={adv.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 px-3 rounded-2xl transition-colors"
                >
                  <div className="flex items-start space-x-3.5">
                    <div
                      className={`p-3 rounded-2xl flex-shrink-0 ${
                        isCrop ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isCrop ? <Sprout className="w-5 h-5" /> : <HeartHandshake className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isCrop ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {isCrop ? "Crop Science" : "Cattle Welfare"}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                        {adv.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Status: <strong className="text-emerald-700 font-semibold">{adv.status}</strong>
                        {adv.estimated_roi_percentage !== undefined && (
                          <span className="ml-2 font-medium text-slate-600">
                            • Est. ROI: +{adv.estimated_roi_percentage}%
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <PdfExportButton advisoryId={adv.id} title={adv.title} variant="secondary" />

                    <Link
                      to={`/advisory/results/${adv.id}`}
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => handleDelete(adv.id, adv.title)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing Page <strong>{pagination.page}</strong> of <strong>{pagination.totalPages}</strong> (
              {pagination.totalRecords} total advisories)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
