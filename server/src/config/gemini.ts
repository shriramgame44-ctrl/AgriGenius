import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const GEMINI_MODEL = "gemini-2.5-flash";

export const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === "AIzaSyYourGeminiApiKeyHere") {
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const SYSTEM_PERSONA_PROMPT = `You are AgriGenius AI, an elite Agricultural Scientist, Senior Agronomist, and Certified Veterinary Welfare Specialist.

Your core mission is to provide rigorous, scientifically grounded, actionable, and sustainable recommendations for agricultural cropping systems and livestock management.

Operating Principles:
1. Agronomic Accuracy: Recommend crop varieties, nutrient ratios, and pest controls that adhere strictly to local climate realities and sustainable soil preservation.
2. Ethical Livestock Preservation: Prioritize the life, welfare, and economic viability of cattle. Under no circumstances provide instructions for culling, slaughter, or inhumane handling. Instead, engineer economically sustainable, high-welfare alternatives: organic bio-fertilizer production, biogas utilization, low-cost balanced nutrition, shelter improvements, ethno-veterinary care, and integration with accredited animal sanctuaries or gaushalas.
3. Structure & Precision: You ALWAYS respond with strictly valid JSON matching the requested Schema. Never add conversational preambles, Markdown code fences, or disclaimers outside the JSON structure.`;

export const CropAdvisoryResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    recommendedCrop: { type: Type.STRING },
    scientificName: { type: Type.STRING },
    suitabilityScore: { type: Type.INTEGER, description: "Score from 1 to 100" },
    rationale: { type: Type.STRING },
    growthDurationDays: { type: Type.INTEGER },
    waterRequirement: { type: Type.STRING },
    fertilizerSchedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          growthStage: { type: Type.STRING },
          nutrientApplication: { type: Type.STRING },
          organicAlternative: { type: Type.STRING },
        },
        required: ["growthStage", "nutrientApplication", "organicAlternative"],
      },
    },
    pestRiskMitigation: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pestOrDisease: { type: Type.STRING },
          symptoms: { type: Type.STRING },
          preventiveAction: { type: Type.STRING },
          ecoFriendlyControl: { type: Type.STRING },
        },
        required: ["pestOrDisease", "symptoms", "preventiveAction", "ecoFriendlyControl"],
      },
    },
    economicForecast: {
      type: Type.OBJECT,
      properties: {
        estimatedCostPerUnitArea: { type: Type.NUMBER },
        projectedYieldPerUnitArea: { type: Type.STRING },
        estimatedNetReturn: { type: Type.NUMBER },
        breakEvenTimelineMonths: { type: Type.NUMBER },
      },
      required: [
        "estimatedCostPerUnitArea",
        "projectedYieldPerUnitArea",
        "estimatedNetReturn",
        "breakEvenTimelineMonths",
      ],
    },
    sustainablePractices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: [
    "recommendedCrop",
    "scientificName",
    "suitabilityScore",
    "rationale",
    "growthDurationDays",
    "waterRequirement",
    "fertilizerSchedule",
    "pestRiskMitigation",
    "economicForecast",
    "sustainablePractices",
  ],
};

export const LivestockWelfareResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    welfareStatusIndex: { type: Type.INTEGER, description: "Scale 1-100 reflecting herd health" },
    immediateInterventions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          priority: { type: Type.STRING, description: "CRITICAL | HIGH | MEDIUM" },
          actionItem: { type: Type.STRING },
          implementationDetails: { type: Type.STRING },
        },
        required: ["priority", "actionItem", "implementationDetails"],
      },
    },
    nutritionalOptimization: {
      type: Type.OBJECT,
      properties: {
        rationBalancingPlan: { type: Type.STRING },
        lowCostLocalFeedSubstitutes: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        mineralAndHydrationProtocol: { type: Type.STRING },
      },
      required: ["rationBalancingPlan", "lowCostLocalFeedSubstitutes", "mineralAndHydrationProtocol"],
    },
    sustainableEconomicPathways: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          pathwayName: { type: Type.STRING, description: "e.g., Vermicompost, Biogas, Dairy Value-Add" },
          implementationDifficulty: { type: Type.STRING },
          projectedMonthlyIncomeOrSavings: { type: Type.STRING },
          actionSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["pathwayName", "implementationDifficulty", "projectedMonthlyIncomeOrSavings", "actionSteps"],
      },
    },
    shelterAndDiseaseManagement: {
      type: Type.OBJECT,
      properties: {
        spaceAndVentilationUpgrades: { type: Type.STRING },
        preventativeHealthAndVaccination: { type: Type.ARRAY, items: { type: Type.STRING } },
        ethnoVeterinaryRemedies: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ["spaceAndVentilationUpgrades", "preventativeHealthAndVaccination", "ethnoVeterinaryRemedies"],
    },
    sanctuaryAndSupportReferrals: {
      type: Type.OBJECT,
      properties: {
        assistanceType: { type: Type.STRING },
        recommendation: { type: Type.STRING },
        qualificationCriteria: { type: Type.STRING },
      },
      required: ["assistanceType", "recommendation", "qualificationCriteria"],
    },
  },
  required: [
    "welfareStatusIndex",
    "immediateInterventions",
    "nutritionalOptimization",
    "sustainableEconomicPathways",
    "shelterAndDiseaseManagement",
    "sanctuaryAndSupportReferrals",
  ],
};
