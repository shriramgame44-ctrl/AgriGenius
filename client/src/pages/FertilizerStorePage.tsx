import React, { useState } from "react";
import { useAgri, CartItem } from "../context/AgriContext";
import {
  ShoppingCart,
  CheckCircle2,
  Tag,
  MapPin,
  Users,
  Calculator,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

interface Product {
  id: string;
  title: string;
  brand: string;
  category: "subsidized" | "bio" | "protection" | "equipment";
  categoryLabelKey: string;
  price: number;
  subsidizedPrice: number;
  packWeight: string;
  npkRatio?: string;
  inStock: boolean;
  dealerDistance: string;
  image: string;
  description: string;
}

const PRODUCTS: Product[] = [
  {
    id: "fert-1",
    title: "IFFCO Nano Urea (Liquid Biotechnology)",
    brand: "IFFCO",
    category: "subsidized",
    categoryLabelKey: "subsidized_urea_dap",
    price: 650,
    subsidizedPrice: 225,
    packWeight: "500ml Bottle (Replaces 45kg Bag)",
    npkRatio: "4% Nitrogen (w/v)",
    inStock: true,
    dealerDistance: "2.4 km away (Sharma Krishi Kendra)",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
    description: "Nano-scale nitrogen particles providing 80%+ nutrient uptake efficiency. Prevents ground water nitrate leaching.",
  },
  {
    id: "fert-2",
    title: "IFFCO Granular DAP (Di-Ammonium Phosphate)",
    brand: "IFFCO",
    category: "subsidized",
    categoryLabelKey: "subsidized_urea_dap",
    price: 2450,
    subsidizedPrice: 1350,
    packWeight: "50kg Bag",
    npkRatio: "18-46-0",
    inStock: true,
    dealerDistance: "3.2 km away (Rampur PAC Society)",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=400&q=80",
    description: "Standard basal fertilizer for strong root elongation and early seedling vigor in wheat, mustard, and gram.",
  },
  {
    id: "fert-3",
    title: "Mahadhan NPK 10-26-26 Complex Fertilizer",
    brand: "Mahadhan",
    category: "subsidized",
    categoryLabelKey: "subsidized_urea_dap",
    price: 1950,
    subsidizedPrice: 1470,
    packWeight: "50kg Bag",
    npkRatio: "10-26-26",
    inStock: true,
    dealerDistance: "3.2 km away",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    description: "High phosphorus and potash grade ideal for flowering, tuber enlargement in potato, and fruit formation.",
  },
  {
    id: "fert-copper",
    title: "Copper Oxychloride 50% WP (Blitox)",
    brand: "Rallis India",
    category: "protection",
    categoryLabelKey: "crop_protection",
    price: 450,
    subsidizedPrice: 380,
    packWeight: "500g Pack",
    inStock: true,
    dealerDistance: "2.4 km away",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
    description: "Broad-spectrum contact bactericide and fungicide against early blight, late blight, and leaf spots.",
  },
  {
    id: "fert-propiconazole",
    title: "Tilt Propiconazole 25% EC Systemic Fungicide",
    brand: "Syngenta",
    category: "protection",
    categoryLabelKey: "crop_protection",
    price: 520,
    subsidizedPrice: 440,
    packWeight: "250ml Bottle",
    inStock: true,
    dealerDistance: "5.1 km away",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    description: "Systemic curative protection against stripe rust, powdery mildew, and sheath blight.",
  },
  {
    id: "fert-bio-1",
    title: "Jeevamrutha Bio-Nutrient Tonic & Microbial Inoculant",
    brand: "Natural Farming Co-op",
    category: "bio",
    categoryLabelKey: "bio_fertilizers",
    price: 350,
    subsidizedPrice: 280,
    packWeight: "5 Liter Canister",
    inStock: true,
    dealerDistance: "1.8 km away (Organic Hub)",
    image: "https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=400&q=80",
    description: "Fermented indigenous beneficial microbial culture enriching soil organic carbon and micro-flora.",
  },
  {
    id: "fert-sprayer",
    title: "16-Liter 12V Dual-Motor Knapsack Battery Sprayer",
    brand: "KisanKraft",
    category: "equipment",
    categoryLabelKey: "sprayers_machinery",
    price: 3200,
    subsidizedPrice: 2450,
    packWeight: "Single Unit with 4 Brass Nozzles",
    inStock: true,
    dealerDistance: "3.2 km away",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=400&q=80",
    description: "Continuous 6-hour battery spraying cycle with regulator valve for uniform leaf droplet misting.",
  },
];

export const FertilizerStorePage: React.FC = () => {
  const { language, t, cart, addToCart, removeFromCart, clearCart, cartTotal, addLedgerEntry, isOffline } = useAgri();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "kcc">("cod");

  // Dosage Calculator state
  const [calcAcreage, setCalcAcreage] = useState<number>(2);
  const [calcCrop, setCalcCrop] = useState<string>("Wheat");
  const [showDosageCalc, setShowDosageCalc] = useState(false);

  const filteredProducts = PRODUCTS.filter((p) => {
    if (selectedCategory === "all") return true;
    return p.category === selectedCategory;
  });

  const handleCheckout = () => {
    addLedgerEntry({
      type: "expense",
      category: "fertilizer",
      title: `Purchased ${cart.length} items from Fertilizer Store (${paymentMethod.toUpperCase()})`,
      amount: cartTotal,
      notes: `Order fulfilled by local dealer. Items: ${cart.map((c) => c.title).join(", ")}`,
    });

    clearCart();
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutSuccess(false);
      setCartOpen(false);
    }, 2500);
  };

  const handleApplyCalculatedDosage = () => {
    const ureaItem = PRODUCTS.find((p) => p.id === "fert-1")!;
    const dapItem = PRODUCTS.find((p) => p.id === "fert-2")!;
    addToCart(ureaItem, calcAcreage);
    addToCart(dapItem, calcAcreage);
    setCartOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Govt Certified License Dealers • DBT Subsidy Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
            {t("fertilizer_store_title")}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 max-w-2xl mt-1">
            {t("fertilizer_store_desc")}
          </p>
        </div>

        {/* Cart Trigger */}
        <button
          onClick={() => setCartOpen(true)}
          className="relative px-5 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs sm:text-sm rounded-2xl flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{t("view_cart")}</span>
          {cart.length > 0 && (
            <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs flex items-center justify-center font-bold">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Community Bulk Pool Bar */}
      <div className="p-4 bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                {t("village_pool_title")}
              </span>
              <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                85% Complete
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Farmers have pooled 34 of 40 bags of Nano Urea. <strong>6 more bags</strong> to unlock 15% wholesale discount and free tractor delivery!
            </p>
          </div>
        </div>

        <div className="w-full md:w-48 bg-stone-200 rounded-full h-3 overflow-hidden">
          <div className="bg-amber-600 h-3 rounded-full w-[85%] transition-all" />
        </div>
      </div>

      {/* Dosage Calculator Callout Toggle */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {t("dosage_calc_title")}
              </h3>
              <p className="text-xs text-slate-500">
                {t("dosage_calc_desc")}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowDosageCalc(!showDosageCalc)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
          >
            {showDosageCalc ? "Close" : "Open"}
          </button>
        </div>

        {showDosageCalc && (
          <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end animate-fade-in">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t("select_crop")}
              </label>
              <select
                value={calcCrop}
                onChange={(e) => setCalcCrop(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium"
              >
                <option value="Wheat">Wheat (गेंहू / गहू)</option>
                <option value="Rice">Paddy / Rice (धान / भात)</option>
                <option value="Tomato">Tomato (टमाटर / टोमॅटो)</option>
                <option value="Cotton">Cotton (कपास / कापूस)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                {t("field_acreage")} <span className="text-emerald-700">{calcAcreage} {t("acres_label")}</span>
              </label>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={calcAcreage}
                onChange={(e) => setCalcAcreage(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <button
                onClick={handleApplyCalculatedDosage}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t("add_acres_dosage")} ({calcAcreage} {t("acres_label")})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {[
          { id: "all", label: t("all_products") },
          { id: "subsidized", label: t("subsidized_urea_dap") },
          { id: "protection", label: t("crop_protection") },
          { id: "bio", label: t("bio_fertilizers") },
          { id: "equipment", label: t("sprayers_machinery") },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 hover:bg-stone-50 border border-stone-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="bg-white rounded-3xl border border-stone-200 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 overflow-hidden bg-stone-100">
                <img
                  src={prod.image}
                  alt={prod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute top-3 left-3 bg-emerald-700 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm">
                  {t(prod.categoryLabelKey)}
                </span>

                {prod.subsidizedPrice < prod.price && (
                  <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {t("subsidized_badge")}
                  </span>
                )}
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                  <span>{prod.brand}</span>
                  {prod.npkRatio && (
                    <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                      NPK {prod.npkRatio}
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                  {prod.title}
                </h3>

                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{prod.dealerDistance}</span>
                </div>
              </div>
            </div>

            <div className="p-4 pt-0 space-y-3">
              <div className="flex items-baseline justify-between border-t border-stone-100 pt-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{prod.subsidizedPrice}
                    </span>
                    {prod.subsidizedPrice < prod.price && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{prod.price}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">{prod.packWeight}</span>
                </div>

                <button
                  onClick={() => addToCart(prod, 1)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t("add")}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">{t("view_cart")}</h3>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  {cart.length}
                </span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 rounded-lg hover:bg-stone-200 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {cart.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <ShoppingCart className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">Cart is empty</p>
                </div>
              ) : (
                cart.map((item) => {
                  const unitPrice = item.subsidizedPrice ?? item.price;
                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3"
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-xl object-cover bg-white p-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 block">
                          ₹{unitPrice} × {item.quantity} = ₹{unitPrice * item.quantity}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase">Total:</span>
                  <span className="text-2xl font-black text-slate-900">₹{cartTotal}</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    {t("payment_mode")}
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      onClick={() => setPaymentMethod("cod")}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        paymentMethod === "cod"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-stone-200 bg-white text-slate-700"
                      }`}
                    >
                      <Banknote className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span className="text-[10px] leading-tight block">{t("cash_on_delivery")}</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("upi")}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        paymentMethod === "upi"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-stone-200 bg-white text-slate-700"
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                      <span className="text-[10px] leading-tight block">{t("upi_scan")}</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("kcc")}
                      className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                        paymentMethod === "kcc"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                          : "border-stone-200 bg-white text-slate-700"
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-amber-600" />
                      <span className="text-[10px] leading-tight block">{t("kisan_credit")}</span>
                    </button>
                  </div>
                </div>

                {checkoutSuccess ? (
                  <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Order Confirmed!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleCheckout}
                    className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <span>{t("confirm_order")}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
