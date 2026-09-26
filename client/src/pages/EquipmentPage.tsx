import React, { useState } from "react";
import { useAgri } from "../context/AgriContext";
import {
  Tractor,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
} from "lucide-react";

interface Equipment {
  id: string;
  name: string;
  category: "tractor" | "harvester" | "drone" | "tillage";
  categoryLabel: string;
  ownerName: string;
  phone: string;
  hourlyRate: number;
  dailyRate: number;
  distance: string;
  location: string;
  isAvailable: boolean;
  image: string;
  specs: string;
}

const EQUIPMENT_LIST: Equipment[] = [
  {
    id: "eq-1",
    name: "Mahindra 575 DI 45 HP Tractor with Laser Leveler",
    category: "tractor",
    categoryLabel: "Tractor & Leveler",
    ownerName: "Harpreet Singh",
    phone: "+91 98140 12345",
    hourlyRate: 850,
    dailyRate: 5800,
    distance: "2.1 km away",
    location: "Rampur, Punjab",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=500&q=80",
    specs: "Includes driver, 4-cylinder fuel efficient engine, laser-guided leveler for zero-water waste.",
  },
  {
    id: "eq-2",
    name: "John Deere 5050D 50 HP with 7-Foot Heavy Rotavator",
    category: "tillage",
    categoryLabel: "Tillage & Rotavator",
    ownerName: "Baldev Raj",
    phone: "+91 98765 43210",
    hourlyRate: 900,
    dailyRate: 6200,
    distance: "3.5 km away",
    location: "Kotli Khurd",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80",
    specs: "High torque rotavator for complete stubble incorporation and rapid rabi seedbed prep.",
  },
  {
    id: "eq-3",
    name: "Preet 987 Self-Propelled Multi-Crop Combine Harvester",
    category: "harvester",
    categoryLabel: "Combine Harvester",
    ownerName: "Dhillon Custom Hiring Center",
    phone: "+91 98142 98765",
    hourlyRate: 2200,
    dailyRate: 15500,
    distance: "6.0 km away",
    location: "Mandi Road",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=500&q=80",
    specs: "Paddy & wheat grain separation with zero grain loss. 14-foot cutter bar.",
  },
  {
    id: "eq-4",
    name: "DJI Agras T10 Precision Drone Crop Sprayer",
    category: "drone",
    categoryLabel: "Drone Spraying",
    ownerName: "AgriTech Rural Solutions",
    phone: "+91 98450 11223",
    hourlyRate: 1200,
    dailyRate: 7500,
    distance: "4.2 km away",
    location: "Block Hub",
    isAvailable: true,
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=500&q=80",
    specs: "Ultra-fine atomization spray. Covers 1 acre in 7 minutes. 100% uniform canopy coverage.",
  },
];

export const EquipmentPage: React.FC = () => {
  const { language, addLedgerEntry } = useAgri();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [bookingModalEq, setBookingModalEq] = useState<Equipment | null>(null);
  const [bookingHours, setBookingHours] = useState<number>(4);
  const [bookedSuccess, setBookedSuccess] = useState(false);

  const filteredEquipment = EQUIPMENT_LIST.filter((eq) => {
    if (selectedCategory === "all") return true;
    return eq.category === selectedCategory;
  });

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingModalEq) return;

    const totalCost = bookingModalEq.hourlyRate * bookingHours;

    addLedgerEntry({
      type: "expense",
      category: "machinery",
      title: `Rented ${bookingModalEq.name} (${bookingHours} hours)`,
      amount: totalCost,
      notes: `Booked from ${bookingModalEq.ownerName} (${bookingModalEq.phone})`,
    });

    setBookedSuccess(true);
    setTimeout(() => {
      setBookedSuccess(false);
      setBookingModalEq(null);
    }, 2200);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-slate-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800 text-teal-200 text-xs font-semibold mb-2">
            <Tractor className="w-3.5 h-3.5" />
            <span>"Uber for Tractors" • Peer-to-Peer Machinery Sharing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {language === "hi"
              ? "कृषि उपकरण व ट्रैक्टर किराया"
              : language === "mr"
              ? "शेत अवजारे व ट्रॅक्टर भाडेतत्वावर"
              : "Machinery Rental & Equipment Sharing"}
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/80 max-w-2xl mt-1">
            {language === "hi"
              ? "महंगी मशीनें खरीदने की ज़रूरत नहीं! आसपास के किसानों से लेजर लेवलर, रोटावेटर, कंबाइन और स्प्रेयर ड्रोन प्रति घंटा किराए पर बुक करें।"
              : "Rent idle heavy farm machinery from neighboring farms at transparent hourly rates. Save capital and accelerate sowing."}
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "all", label: "All Equipment" },
          { id: "tractor", label: "Tractors & Levelers" },
          { id: "tillage", label: "Rotavators & Tillers" },
          { id: "harvester", label: "Combine Harvesters" },
          { id: "drone", label: "Drone Sprayers" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedCategory(f.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === f.id
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 border border-stone-200 hover:bg-stone-50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredEquipment.map((eq) => (
          <div
            key={eq.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-48 overflow-hidden bg-stone-100">
                <img
                  src={eq.image}
                  alt={eq.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {eq.categoryLabel}
                </span>
                <span className="absolute top-3 right-3 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
                  {eq.distance}
                </span>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-bold text-slate-900 text-base leading-tight">{eq.name}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{eq.specs}</p>

                <div className="pt-2 flex items-center justify-between text-xs text-slate-600 border-t border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{eq.location}</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-slate-700">
                    <span>Owner: {eq.ownerName}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Book */}
            <div className="p-5 pt-0">
              <div className="border-t border-stone-100 pt-3 flex items-baseline justify-between">
                <div>
                  <p className="text-xl font-black text-slate-900">
                    ₹{eq.hourlyRate}
                    <span className="text-xs font-normal text-slate-500"> / hour</span>
                  </p>
                  <span className="text-[10px] text-slate-400">or ₹{eq.dailyRate} / full day</span>
                </div>

                <button
                  onClick={() => setBookingModalEq(eq)}
                  className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Machinery</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {bookingModalEq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-stone-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Instant Equipment Reservation</h3>
              <button onClick={() => setBookingModalEq(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{bookingModalEq.name}</h4>
                <p className="text-xs text-slate-500">
                  Owner: {bookingModalEq.ownerName} • {bookingModalEq.distance}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Required Duration (Hours):{" "}
                  <span className="text-teal-700 font-extrabold">{bookingHours} Hours</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="1"
                  value={bookingHours}
                  onChange={(e) => setBookingHours(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>

              <div className="p-3.5 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-teal-800 uppercase font-bold block">
                    Estimated Rental Cost:
                  </span>
                  <span className="text-xs text-slate-500">
                    ₹{bookingModalEq.hourlyRate} × {bookingHours} hrs
                  </span>
                </div>
                <span className="text-xl font-black text-teal-900">
                  ₹{bookingModalEq.hourlyRate * bookingHours}
                </span>
              </div>

              {bookedSuccess ? (
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Reserved! SMS sent to tractor owner & logged in ledger.</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-3 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking & Notify Owner</span>
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
