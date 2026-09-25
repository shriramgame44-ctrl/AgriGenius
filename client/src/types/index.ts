export type UnitType = "METRIC" | "IMPERIAL";

export interface User {
  id: string;
  email: string;
  fullName: string;
  farmName?: string;
  locationRegion?: string;
  preferredUnits: UnitType;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
}

// Crop Advisory Types
export interface CropInput {
  region: string;
  plotSize: number;
  units: "ACRES" | "HECTARES";
  soilType: string;
  soilPh: number;
  nitrogen: "LOW" | "MEDIUM" | "HIGH";
  phosphorus: "LOW" | "MEDIUM" | "HIGH";
  potassium: "LOW" | "MEDIUM" | "HIGH";
  irrigationType: string;
  season: string;
  previousCrop: string;
  budget: number;
}

export interface FertilizerScheduleItem {
  growthStage: string;
  nutrientApplication: string;
  organicAlternative: string;
}

export interface PestRiskMitigationItem {
  pestOrDisease: string;
  symptoms: string;
  preventiveAction: string;
  ecoFriendlyControl: string;
}

export interface EconomicForecast {
  estimatedCostPerUnitArea: number;
  projectedYieldPerUnitArea: string;
  estimatedNetReturn: number;
  breakEvenTimelineMonths: number;
}

export interface CropAdvisoryResponse {
  recommendedCrop: string;
  scientificName: string;
  suitabilityScore: number;
  rationale: string;
  growthDurationDays: number;
  waterRequirement: string;
  fertilizerSchedule: FertilizerScheduleItem[];
  pestRiskMitigation: PestRiskMitigationItem[];
  economicForecast: EconomicForecast;
  sustainablePractices: string[];
}

// Cattle Welfare Types
export interface LivestockInput {
  bovineCategory: string;
  headCount: number;
  ageDistribution: string;
  healthStatus: string;
  feedResources: string;
  shelterType: string;
  distressFactors: string;
  primaryObjective: string;
}

export interface ImmediateIntervention {
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | string;
  actionItem: string;
  implementationDetails: string;
}

export interface NutritionalOptimization {
  rationBalancingPlan: string;
  lowCostLocalFeedSubstitutes: string[];
  mineralAndHydrationProtocol: string;
}

export interface SustainableEconomicPathway {
  pathwayName: string;
  implementationDifficulty: string;
  projectedMonthlyIncomeOrSavings: string;
  actionSteps: string[];
}

export interface ShelterAndDiseaseManagement {
  spaceAndVentilationUpgrades: string;
  preventativeHealthAndVaccination: string[];
  ethnoVeterinaryRemedies: string[];
}

export interface SanctuaryAndSupportReferrals {
  assistanceType: string;
  recommendation: string;
  qualificationCriteria: string;
}

export interface LivestockWelfareResponse {
  welfareStatusIndex: number;
  immediateInterventions: ImmediateIntervention[];
  nutritionalOptimization: NutritionalOptimization;
  sustainableEconomicPathways: SustainableEconomicPathway[];
  shelterAndDiseaseManagement: ShelterAndDiseaseManagement;
  sanctuaryAndSupportReferrals: SanctuaryAndSupportReferrals;
}

export type AdvisoryType = "CROP" | "LIVESTOCK_WELFARE";

export interface AdvisoryRecord<T = CropAdvisoryResponse | LivestockWelfareResponse> {
  id: string;
  user_id: string;
  advisory_type: AdvisoryType;
  title: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  input_parameters: CropInput | LivestockInput;
  advisory_response: T;
  estimated_roi_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface CattleSanctuary {
  id: string;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  state_region: string;
  capacity_status: "OPEN" | "LIMITED" | "FULL";
  services_offered: string[];
  created_at: string;
}
