import { z } from "zod";

export const CropInputZodSchema = z.object({
  region: z.string().min(2, "Region is required"),
  plotSize: z.number().positive("Plot size must be greater than 0"),
  units: z.enum(["ACRES", "HECTARES"]).default("ACRES"),
  soilType: z.string().min(2, "Soil type is required"),
  soilPh: z.number().min(3.0, "Soil pH must be >= 3.0").max(10.0, "Soil pH must be <= 10.0"),
  nitrogen: z.enum(["LOW", "MEDIUM", "HIGH"]),
  phosphorus: z.enum(["LOW", "MEDIUM", "HIGH"]),
  potassium: z.enum(["LOW", "MEDIUM", "HIGH"]),
  irrigationType: z.string().min(2, "Irrigation type is required"),
  season: z.string().min(2, "Target season is required"),
  previousCrop: z.string().min(2, "Previous crop is required"),
  budget: z.number().nonnegative("Budget must be non-negative"),
});

export const LivestockInputZodSchema = z.object({
  bovineCategory: z.string().min(2, "Bovine category is required"),
  headCount: z.number().int().positive("Must specify at least 1 animal"),
  ageDistribution: z.string().min(2, "Age distribution is required"),
  healthStatus: z.string().min(5, "Health status description required"),
  feedResources: z.string().min(5, "Feed resources description required"),
  shelterType: z.string().min(2, "Shelter type is required"),
  distressFactors: z.string().min(2, "Distress factors are required"),
  primaryObjective: z.string().min(2, "Primary objective is required"),
});

// Zod schemas for validating AI outputs
export const FertilizerScheduleItemSchema = z.object({
  growthStage: z.string(),
  nutrientApplication: z.string(),
  organicAlternative: z.string(),
});

export const PestRiskMitigationItemSchema = z.object({
  pestOrDisease: z.string(),
  symptoms: z.string(),
  preventiveAction: z.string(),
  ecoFriendlyControl: z.string(),
});

export const EconomicForecastSchema = z.object({
  estimatedCostPerUnitArea: z.number(),
  projectedYieldPerUnitArea: z.string(),
  estimatedNetReturn: z.number(),
  breakEvenTimelineMonths: z.number(),
});

export const CropAdvisoryResponseZodSchema = z.object({
  recommendedCrop: z.string(),
  scientificName: z.string(),
  suitabilityScore: z.number().int().min(1).max(100),
  rationale: z.string(),
  growthDurationDays: z.number().int(),
  waterRequirement: z.string(),
  fertilizerSchedule: z.array(FertilizerScheduleItemSchema),
  pestRiskMitigation: z.array(PestRiskMitigationItemSchema),
  economicForecast: EconomicForecastSchema,
  sustainablePractices: z.array(z.string()),
});

export const ImmediateInterventionSchema = z.object({
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).or(z.string()),
  actionItem: z.string(),
  implementationDetails: z.string(),
});

export const NutritionalOptimizationSchema = z.object({
  rationBalancingPlan: z.string(),
  lowCostLocalFeedSubstitutes: z.array(z.string()),
  mineralAndHydrationProtocol: z.string(),
});

export const SustainableEconomicPathwaySchema = z.object({
  pathwayName: z.string(),
  implementationDifficulty: z.string(),
  projectedMonthlyIncomeOrSavings: z.string(),
  actionSteps: z.array(z.string()),
});

export const ShelterAndDiseaseManagementSchema = z.object({
  spaceAndVentilationUpgrades: z.string(),
  preventativeHealthAndVaccination: z.array(z.string()),
  ethnoVeterinaryRemedies: z.array(z.string()),
});

export const SanctuaryAndSupportReferralSchema = z.object({
  assistanceType: z.string(),
  recommendation: z.string(),
  qualificationCriteria: z.string(),
});

export const LivestockWelfareResponseZodSchema = z.object({
  welfareStatusIndex: z.number().int().min(1).max(100),
  immediateInterventions: z.array(ImmediateInterventionSchema),
  nutritionalOptimization: NutritionalOptimizationSchema,
  sustainableEconomicPathways: z.array(SustainableEconomicPathwaySchema),
  shelterAndDiseaseManagement: ShelterAndDiseaseManagementSchema,
  sanctuaryAndSupportReferrals: SanctuaryAndSupportReferralSchema,
});

export type CropInput = z.infer<typeof CropInputZodSchema>;
export type LivestockInput = z.infer<typeof LivestockInputZodSchema>;
export type CropAdvisoryResponse = z.infer<typeof CropAdvisoryResponseZodSchema>;
export type LivestockWelfareResponse = z.infer<typeof LivestockWelfareResponseZodSchema>;
