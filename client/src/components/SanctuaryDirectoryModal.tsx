import React, { useState } from "react";
import { useSanctuaries } from "../api/resource.api";
import {
  X,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  AlertCircle,
  HeartHandshake,
} from "lucide-react";

interface SanctuaryDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRegion?: string;
}

export const SanctuaryDirectoryModal: React.FC<SanctuaryDirectoryModalProps> = ({
  isOpen,
  onClose,
  defaultRegion = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState(defaultRegion);

  const { data, isLoading } = useSanctuaries(selectedRegion, searchTerm);

  if (!isOpen) return null;

  const regions = [
    "All Regions",
    "Rajasthan",
    "Gujarat",
    "Punjab",
    "Maharashtra",
    "Karnataka",
    "Uttar Pradesh",
    "Tamil Nadu",
  ];

  const getCapacityBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Accepting Bovines (Open)
          </span>
        );
      case "LIMITED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            Limited Capacity
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            At Capacity
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-800 to-emerald-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-700/60 rounded-xl">
              <HeartHandshake className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cattle Sanctuaries & Gaushala Directory</h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                Accredited rescue havens, lifetime rehabilitation sanctuaries, and veterinary NGOs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-emerald-700/50 text-emerald-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by shelter name or service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value === "All Regions" ? "" : e.target.value)}
              className="w-full px-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-700"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg === "All Regions" ? "" : reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400">Loading sanctuary directory...</div>
          ) : !data?.data || data.data.length === 0 ? (
            <div className="py-12 text-center">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600 font-medium">No verified sanctuaries found for this filter.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing your search or choosing another state.</p>
            </div>
          ) : (
            data.data.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-100 hover:border-emerald-300 bg-white hover:bg-emerald-50/20 transition-all shadow-sm flex flex-col justify-between"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{item.name}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{item.state_region}</span>
                      {item.contact_person && <span>• Contact: {item.contact_person}</span>}
                    </div>
                  </div>
                  <div>{getCapacityBadge(item.capacity_status)}</div>
                </div>

                <div className="flex flex-wrap gap-2 my-2">
                  {item.services_offered.map((srv, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700"
                    >
                      {srv.replace(/_/g, " ")}
                    </span>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {item.phone}
                    </a>
                  )}
                  {item.email && (
                    <a
                      href={`mailto:${item.email}`}
                      className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {item.email}
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center sm:text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-sm font-semibold bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
          >
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
};
