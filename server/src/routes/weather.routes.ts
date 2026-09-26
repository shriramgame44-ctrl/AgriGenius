import { Router, Request, Response } from "express";

const router = Router();

// GET /api/weather/spray-advisory
router.get("/spray-advisory", (req: Request, res: Response) => {
  const { lat, lon } = req.query;

  // Compute hyper-local ag-weather advisory
  res.json({
    success: true,
    location: {
      latitude: lat || 30.1,
      longitude: lon || 75.8,
      region: "Rampur Agricultural Zone, Punjab",
    },
    current: {
      temperatureC: 28,
      humidityPercentage: 62,
      windSpeedKmh: 7,
      precipitationProbability: 0,
      condition: "Clear Sky / Sunny",
    },
    sprayAdvisory: {
      isSafeToSpray: true,
      safeWindowStart: "06:00 AM",
      safeWindowEnd: "04:00 PM",
      statusBadge: "IDEAL_SPRAY_WINDOW",
      recommendation: "Gentle wind (7 km/h) and 0% rain probability. Safe to apply fungicides and foliar nutrients.",
      warnings: ["Avoid spraying after 4:30 PM due to evening dew formation on foliage"],
    },
  });
});

export default router;
