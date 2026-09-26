import React, { useState } from "react";
import { useAgri, LedgerEntry } from "../context/AgriContext";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PlusCircle,
  Filter,
  Calendar,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CheckCircle2,
} from "lucide-react";

export const LedgerPage: React.FC = () => {
  const { language, ledger, addLedgerEntry, isOffline } = useAgri();
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New entry form state
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState<LedgerEntry["category"]>("fertilizer");
  const [notes, setNotes] = useState("");

  const filteredEntries = ledger.filter((entry) => {
    if (filterCategory === "all") return true;
    return entry.category === filterCategory;
  });

  const totalIncome = ledger
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = ledger
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addLedgerEntry({
      type,
      category,
      title,
      amount,
      notes,
    });

    setAddModalOpen(false);
    setTitle("");
    setAmount(1000);
    setNotes("");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/80 text-emerald-200 text-xs font-semibold mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <span>Digital Kisan Khata • Automatic P&L Reconciliation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {language === "hi"
              ? "दैनिक कृषि खाता बही (P&L)"
              : language === "mr"
              ? "दैनिक कृषी हिशोब वही (P&L)"
              : "Farm Expense & Profit Ledger"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1">
            {language === "hi"
              ? "उर्वरक की खरीद, मजदूरी और मंडी में फसल बिक्री का स्वतः हिसाब रखें। मौसम का शुद्ध लाभ एक नज़र में देखें।"
              : "Track farm inputs, labor, fuel, and crop sales. Auto-synced with Fertilizer Store checkouts and Direct Chat sales."}
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Financial Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Crop Revenue
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">₹{totalIncome}</p>
            <span className="text-[11px] text-slate-400">Marketplace & Chat Sales</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Farm Expenses
            </span>
            <p className="text-2xl font-black text-rose-600 mt-1">₹{totalExpense}</p>
            <span className="text-[11px] text-slate-400">Fertilizers, labor & rentals</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Net Seasonal Profit
            </span>
            <p className="text-2xl font-black text-slate-900 mt-1">₹{netProfit}</p>
            <span className="text-[11px] text-emerald-700 font-bold">
              {netProfit >= 0 ? "+ Positive Net Margin" : "- Deficit"}
            </span>
          </div>
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Records" },
          { id: "fertilizer", label: "Fertilizer & Chemicals" },
          { id: "produce_sale", label: "Crop Produce Sales" },
          { id: "machinery", label: "Machinery Rental" },
          { id: "labor", label: "Farm Labor" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilterCategory(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              filterCategory === f.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Transaction Journal</h3>
          <span className="text-xs text-slate-500">{filteredEntries.length} Records</span>
        </div>

        <div className="divide-y divide-stone-100">
          {filteredEntries.map((item) => {
            const isIncome = item.type === "income";

            return (
              <div
                key={item.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2.5 rounded-2xl ${
                      isIncome ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          isIncome ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {item.category.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">{item.date}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{item.title}</h4>
                    {item.notes && <p className="text-xs text-slate-500 mt-0.5">{item.notes}</p>}
                  </div>
                </div>

                <div className="self-end sm:self-center text-right">
                  <span
                    className={`text-base font-black ${
                      isIncome ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {isIncome ? "+ " : "- "}₹{item.amount}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {isOffline ? "Staged in offline DB" : "Reconciled"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Transaction Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Daily Farm Transaction</h3>
              <button onClick={() => setAddModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType("expense")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === "expense"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "bg-stone-100 text-slate-700"
                  }`}
                >
                  Expense (लागत / खर्च)
                </button>
                <button
                  type="button"
                  onClick={() => setType("income")}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    type === "income"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-stone-100 text-slate-700"
                  }`}
                >
                  Income (कमाई / बिक्री)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Description / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50kg DAP Fertilizer or Tractor Fuel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  >
                    <option value="fertilizer">Fertilizer & Nutrition</option>
                    <option value="seeds">Seeds & Saplings</option>
                    <option value="pesticides">Pesticides & Spray</option>
                    <option value="labor">Farm Labor</option>
                    <option value="machinery">Machinery & Fuel</option>
                    <option value="produce_sale">Produce Sale</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Amount (₹ INR)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Field 1 preparation"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Entry to Khata Ledger</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
