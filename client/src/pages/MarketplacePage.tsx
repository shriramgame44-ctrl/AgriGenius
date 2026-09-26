import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgri, ProduceListing } from "../context/AgriContext";
import {
  TrendingUp,
  MessageCircle,
  PlusCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Filter,
  DollarSign,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

const INITIAL_PRODUCE: ProduceListing[] = [
  {
    id: "prod-1",
    farmerName: "S. Gurpreet Singh",
    farmerPhone: "+91 98140 34567",
    cropName: "Sharbati Golden Wheat",
    variety: "HD-2967 High Protein",
    quantityQuintals: 65,
    askingPricePerQuintal: 2450,
    location: "Khanna Mandi, Punjab",
    harvestDate: "2026-09-20",
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80",
    grade: "A+",
  },
  {
    id: "prod-2",
    farmerName: "Rajesh Patil",
    farmerPhone: "+91 94220 45678",
    cropName: "Organic Vine-Ripened Tomatoes",
    variety: "Abhinav F1 Hybrid",
    quantityQuintals: 40,
    askingPricePerQuintal: 2500, // ₹25/kg
    location: "Nashik, Maharashtra",
    harvestDate: "2026-09-25",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=500&q=80",
    grade: "A+",
  },
  {
    id: "prod-3",
    farmerName: "Rameshwar Lal",
    farmerPhone: "+91 98290 12345",
    cropName: "Nashik Red Export Onions",
    variety: "Garwa Rabi Onion",
    quantityQuintals: 90,
    askingPricePerQuintal: 1950,
    location: "Lasalgaon APMC, Maharashtra",
    harvestDate: "2026-09-22",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=80",
    grade: "A",
  },
  {
    id: "prod-4",
    farmerName: "Devender Yadav",
    farmerPhone: "+91 99170 67890",
    cropName: "Basmati Paddy (Pusa 1121)",
    variety: "Traditional Long Grain",
    quantityQuintals: 110,
    askingPricePerQuintal: 3800,
    location: "Karnal, Haryana",
    harvestDate: "2026-09-24",
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=500&q=80",
    grade: "A+",
  },
];

const MANDI_RATES = [
  { crop: "Sharbati Wheat", mandi: "Khanna APMC", min: 2350, max: 2520, trend: "+₹40" },
  { crop: "Hybrid Tomatoes", mandi: "Azadpur Delhi", min: 2200, max: 2700, trend: "+₹120" },
  { crop: "Red Onion", mandi: "Lasalgaon", min: 1800, max: 2100, trend: "-₹30" },
  { crop: "Basmati 1121", mandi: "Karnal Mandi", min: 3650, max: 3950, trend: "+₹80" },
  { crop: "Cotton (Medium)", mandi: "Rajkot APMC", min: 6600, max: 7100, trend: "+₹50" },
];

export const MarketplacePage: React.FC = () => {
  const { language, setActiveChatListing } = useAgri();
  const navigate = useNavigate();

  const [listings, setListings] = useState<ProduceListing[]>(INITIAL_PRODUCE);
  const [postModalOpen, setPostModalOpen] = useState(false);

  // New posting form state
  const [newCropName, setNewCropName] = useState("");
  const [newVariety, setNewVariety] = useState("");
  const [newQty, setNewQty] = useState<number>(25);
  const [newPrice, setNewPrice] = useState<number>(2200);
  const [newLocation, setNewLocation] = useState("Rampur, Punjab");

  const handleStartChat = (item: ProduceListing) => {
    setActiveChatListing(item);
    navigate("/chat");
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName) return;

    const newListing: ProduceListing = {
      id: "prod-" + Date.now(),
      farmerName: "You (Active Farmer)",
      farmerPhone: "+91 98000 00000",
      cropName: newCropName,
      variety: newVariety || "Farm Fresh",
      quantityQuintals: newQty,
      askingPricePerQuintal: newPrice,
      location: newLocation,
      harvestDate: new Date().toISOString().split("T")[0],
      image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=500&q=80",
      grade: "A+",
    };

    setListings([newListing, ...listings]);
    setPostModalOpen(false);
    setNewCropName("");
    setNewVariety("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800 text-blue-200 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Direct B2B & B2C Farmers Marketplace • Zero Middlemen Commission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {language === "hi"
              ? "प्रत्यक्ष किसान बाज़ार व मंडी भाव"
              : language === "mr"
              ? "थेट शेतकरी बाजार व मंडी भाव"
              : "Produce Marketplace & Live Mandi Rates"}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl mt-1">
            {language === "hi"
              ? "अपनी ताज़ा फसल का फोटो व मात्रा डालें, थोक खरीदारों से सीधे इंस्टाग्राम शैली में मोलभाव करें और पक्के सौदे करें।"
              : "Post fresh harvest lots, browse live APMC commodity rates, and negotiate directly with verified restaurant and wholesale buyers in real-time."}
          </p>
        </div>

        <button
          onClick={() => setPostModalOpen(true)}
          className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Post My Harvest Lot</span>
        </button>
      </div>

      {/* Live Mandi Commodity Rates Ticker */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Live Regional APMC Mandi Rates (₹ / Quintal)</span>
          </span>
          <span className="text-[11px] text-slate-400">Updated 15 mins ago</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {MANDI_RATES.map((rate, idx) => (
            <div
              key={idx}
              className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1"
            >
              <span className="text-xs font-bold text-slate-900 block truncate">
                {rate.crop}
              </span>
              <span className="text-[10px] text-slate-400 block truncate">{rate.mandi}</span>
              <div className="flex items-baseline justify-between pt-1">
                <span className="text-sm font-extrabold text-slate-900">₹{rate.max}</span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">
                  {rate.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Produce Listings Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            Available Fresh Lots Ready for Dispatch
          </h2>
          <span className="text-xs text-slate-500">{listings.length} Active Listings</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {listings.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={item.image}
                    alt={item.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Grade {item.grade}
                  </span>
                  <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                    {item.quantityQuintals} Quintals
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[11px] font-bold text-emerald-700 block">
                    {item.variety}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">
                    {item.cropName}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Harvested: {item.harvestDate}</span>
                  </div>
                </div>
              </div>

              {/* Price & Action */}
              <div className="p-4 pt-0 space-y-3">
                <div className="border-t border-stone-100 pt-3 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Asking Rate
                    </span>
                    <p className="text-lg font-black text-slate-900">
                      ₹{item.askingPricePerQuintal}
                      <span className="text-xs font-normal text-slate-500"> / Qtl</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartChat(item)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat & Bargain</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post Produce Modal */}
      {postModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Post Fresh Harvest to Direct Marketplace</h3>
              <button onClick={() => setPostModalOpen(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Crop Name (e.g. Sharbati Wheat, Tomatoes)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Red Onions"
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Variety / Seed Type
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pusa Hybrid A1"
                  value={newVariety}
                  onChange={(e) => setNewVariety(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newQty}
                    onChange={(e) => setNewQty(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Asking Price (₹ / Qtl)
                  </label>
                  <input
                    type="number"
                    required
                    min="100"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Farm / Village Location
                </label>
                <input
                  type="text"
                  required
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Listing to All Buyers</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
