import { Router, Request, Response } from "express";

const router = Router();

const FERTILIZERS_CATALOG = [
  {
    id: "fert-1",
    title: "IFFCO Nano Urea (Liquid Biotechnology)",
    brand: "IFFCO",
    category: "subsidized",
    price: 650,
    subsidizedPrice: 225,
    packWeight: "500ml Bottle (Replaces 45kg Bag)",
    npkRatio: "4% Nitrogen (w/v)",
    dealerName: "Sharma Krishi Kendra",
    dealerDistanceKm: 2.4,
    inStock: true,
  },
  {
    id: "fert-2",
    title: "IFFCO Granular DAP (Di-Ammonium Phosphate)",
    brand: "IFFCO",
    category: "subsidized",
    price: 2450,
    subsidizedPrice: 1350,
    packWeight: "50kg Bag",
    npkRatio: "18-46-0",
    dealerName: "Rampur PAC Society",
    dealerDistanceKm: 3.2,
    inStock: true,
  },
  {
    id: "fert-copper",
    title: "Copper Oxychloride 50% WP (Blitox)",
    brand: "Rallis India",
    category: "protection",
    price: 450,
    subsidizedPrice: 380,
    packWeight: "500g Pack",
    dealerName: "Sharma Krishi Kendra",
    dealerDistanceKm: 2.4,
    inStock: true,
  },
];

// GET /api/store/products
router.get("/products", (req: Request, res: Response) => {
  const { category } = req.query;
  if (category && category !== "all") {
    return res.json({ success: true, data: FERTILIZERS_CATALOG.filter((p) => p.category === category) });
  }
  return res.json({ success: true, data: FERTILIZERS_CATALOG });
});

// POST /api/store/orders
router.post("/orders", (req: Request, res: Response) => {
  const { items, paymentMethod, deliveryType } = req.body;
  const orderId = "ord-" + Date.now();

  res.status(201).json({
    success: true,
    message: "Order placed successfully with local dealer",
    order: {
      orderId,
      items: items || [],
      paymentMethod: paymentMethod || "cash_on_delivery",
      deliveryType: deliveryType || "pickup",
      status: "confirmed",
      estimatedDispatch: "Within 24 Hours",
    },
  });
});

export default router;
