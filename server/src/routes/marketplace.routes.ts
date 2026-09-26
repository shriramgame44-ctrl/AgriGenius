import { Router, Request, Response } from "express";

const router = Router();

const PRODUCE_LISTINGS = [
  {
    id: "prod-1",
    farmerName: "S. Gurpreet Singh",
    cropName: "Sharbati Golden Wheat",
    quantityQuintals: 65,
    askingPricePerQuintal: 2450,
    location: "Khanna Mandi, Punjab",
    grade: "A+",
  },
  {
    id: "prod-2",
    farmerName: "Rajesh Patil",
    cropName: "Organic Vine-Ripened Tomatoes",
    quantityQuintals: 40,
    askingPricePerQuintal: 2500,
    location: "Nashik, Maharashtra",
    grade: "A+",
  },
];

const MANDI_COMMODITY_RATES = [
  { crop: "Sharbati Wheat", mandi: "Khanna APMC", minPrice: 2350, maxPrice: 2520, unit: "Quintal" },
  { crop: "Hybrid Tomatoes", mandi: "Azadpur Delhi", minPrice: 2200, maxPrice: 2700, unit: "Quintal" },
  { crop: "Red Onion", mandi: "Lasalgaon", minPrice: 1800, maxPrice: 2100, unit: "Quintal" },
  { crop: "Basmati 1121", mandi: "Karnal Mandi", minPrice: 3650, maxPrice: 3950, unit: "Quintal" },
];

// GET /api/marketplace/listings
router.get("/listings", (req: Request, res: Response) => {
  res.json({ success: true, data: PRODUCE_LISTINGS });
});

// GET /api/marketplace/mandi-rates
router.get("/mandi-rates", (req: Request, res: Response) => {
  res.json({ success: true, data: MANDI_COMMODITY_RATES, updated: new Date().toISOString() });
});

export default router;
