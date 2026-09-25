import PDFDocument from "pdfkit";
import { Response } from "express";

interface AdvisoryData {
  id: string;
  advisory_type: "CROP" | "LIVESTOCK_WELFARE";
  title: string;
  created_at: string | Date;
  input_parameters: any;
  advisory_response: any;
  estimated_roi_percentage?: number;
  full_name?: string;
  farm_name?: string;
}

export const generateAdvisoryPdf = (advisory: AdvisoryData, res: Response): void => {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
    bufferPages: true,
  });

  // Set response headers for PDF download/streaming
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `inline; filename="AgriGenius_Report_${advisory.advisory_type}_${advisory.id.slice(0, 8)}.pdf"`
  );

  doc.pipe(res);

  const primaryColor = "#047857"; // Emerald Green
  const secondaryColor = "#065F46";
  const darkTextColor = "#1F2937";
  const lightBgColor = "#F0FDF4";
  const accentAmber = "#D97706";

  // --- Header ---
  doc.rect(40, 40, 515, 65).fill(lightBgColor);
  doc.fillColor(primaryColor).fontSize(22).font("Helvetica-Bold").text("AgriGenius", 55, 52);
  doc.fillColor("#059669").fontSize(10).font("Helvetica").text("AI-Powered Agriculture & Livestock Advisory Assistant", 55, 78);

  const formattedDate = new Date(advisory.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.fillColor("#4B5563").fontSize(9).font("Helvetica").text(`Report Date: ${formattedDate}`, 380, 55, { align: "right" });
  doc.text(`Doc ID: ${advisory.id.slice(0, 8)}`, 380, 70, { align: "right" });
  doc.text(`Type: ${advisory.advisory_type}`, 380, 85, { align: "right" });

  doc.moveDown(3);

  // --- Title Section ---
  doc.fillColor(darkTextColor).fontSize(16).font("Helvetica-Bold").text(advisory.title, 40, 125);
  if (advisory.farm_name) {
    doc.fillColor("#6B7280").fontSize(10).font("Helvetica").text(`Farm: ${advisory.farm_name} (${advisory.full_name || "Owner"})`, 40, 145);
  }

  doc.moveTo(40, 165).lineTo(555, 165).strokeColor("#E5E7EB").stroke();

  // Ensure advisory_response is parsed object
  const data = typeof advisory.advisory_response === "string"
    ? JSON.parse(advisory.advisory_response)
    : advisory.advisory_response || {};

  let currentY = 180;

  // --- Content Handling by Type ---
  if (advisory.advisory_type === "CROP") {
    // Highlights Card
    doc.rect(40, currentY, 515, 70).fillAndStroke("#F9FAFB", "#E5E7EB");
    doc.fillColor(primaryColor).fontSize(12).font("Helvetica-Bold").text("Recommended Crop:", 55, currentY + 12);
    doc.fillColor(darkTextColor).fontSize(14).text(`${data.recommendedCrop || "Crop Plan"} (${data.scientificName || ""})`, 180, currentY + 11);

    doc.fontSize(10).font("Helvetica").fillColor("#374151");
    doc.text(`Suitability Score: ${data.suitabilityScore || 0}/100`, 55, currentY + 36);
    doc.text(`Growth Cycle: ${data.growthDurationDays} Days`, 220, currentY + 36);
    doc.text(`Est. ROI: +${data.economicForecast?.estimatedNetReturn ? Math.round((data.economicForecast.estimatedNetReturn / (data.economicForecast.estimatedCostPerUnitArea || 1)) * 100) : 0}%`, 380, currentY + 36);
    doc.text(`Water Need: ${data.waterRequirement}`, 55, currentY + 50);

    currentY += 85;

    // Rationale
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Agronomic Rationale", 40, currentY);
    currentY += 16;
    doc.fillColor(darkTextColor).fontSize(9.5).font("Helvetica").text(data.rationale, 40, currentY, { width: 515, lineGap: 3 });
    currentY = doc.y + 15;

    // Fertilizer & Nutrient Roadmap
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Nutrient & Fertilization Schedule", 40, currentY);
    currentY += 18;

    if (Array.isArray(data.fertilizerSchedule)) {
      data.fertilizerSchedule.forEach((item: any, idx: number) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 40;
        }
        doc.rect(40, currentY, 515, 38).fill("#F0FDF4");
        doc.fillColor(primaryColor).fontSize(9.5).font("Helvetica-Bold").text(`${idx + 1}. ${item.growthStage}`, 50, currentY + 6);
        doc.fillColor(darkTextColor).fontSize(8.5).font("Helvetica").text(`Nutrient: ${item.nutrientApplication}`, 50, currentY + 18, { width: 500 });
        doc.fillColor("#047857").fontSize(8.5).text(`Organic Alt: ${item.organicAlternative}`, 50, currentY + 28, { width: 500 });
        currentY += 44;
      });
    }

    currentY += 10;
    if (currentY > 680) {
      doc.addPage();
      currentY = 40;
    }

    // Pest & Disease Mitigation
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Integrated Pest & Disease Diagnosis & Mitigation", 40, currentY);
    currentY += 18;

    if (Array.isArray(data.pestRiskMitigation)) {
      data.pestRiskMitigation.forEach((item: any) => {
        if (currentY > 690) {
          doc.addPage();
          currentY = 40;
        }
        doc.rect(40, currentY, 515, 48).fillAndStroke("#FFFBEB", "#FDE68A");
        doc.fillColor(accentAmber).fontSize(9.5).font("Helvetica-Bold").text(`Pest/Pathogen: ${item.pestOrDisease}`, 50, currentY + 6);
        doc.fillColor(darkTextColor).fontSize(8).font("Helvetica").text(`Symptoms: ${item.symptoms}`, 50, currentY + 18, { width: 495 });
        doc.text(`Prevention: ${item.preventiveAction}`, 50, currentY + 28, { width: 495 });
        doc.fillColor("#B45309").text(`Eco-friendly Control: ${item.ecoFriendlyControl}`, 50, currentY + 38, { width: 495 });
        currentY += 54;
      });
    }

    currentY += 10;
    if (currentY > 690) {
      doc.addPage();
      currentY = 40;
    }

    // Economic Forecast
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Economic Forecast & Sustainability", 40, currentY);
    currentY += 18;

    doc.rect(40, currentY, 515, 42).fill("#F3F4F6");
    doc.fillColor(darkTextColor).fontSize(9).font("Helvetica");
    doc.text(`Estimated Cost/Unit: $${data.economicForecast?.estimatedCostPerUnitArea || 0}`, 50, currentY + 8);
    doc.text(`Projected Total Yield: ${data.economicForecast?.projectedYieldPerUnitArea || "N/A"}`, 220, currentY + 8);
    doc.text(`Estimated Net Return: $${data.economicForecast?.estimatedNetReturn || 0}`, 50, currentY + 24);
    doc.text(`Break-even Timeline: ${data.economicForecast?.breakEvenTimelineMonths || 0} Months`, 220, currentY + 24);

    currentY += 52;
  } else {
    // LIVESTOCK WELFARE REPORT
    const data = advisory.advisory_response;

    // Welfare Index Card
    doc.rect(40, currentY, 515, 60).fillAndStroke("#FEF3C7", "#FDE68A");
    doc.fillColor(accentAmber).fontSize(13).font("Helvetica-Bold").text("Cattle Welfare & Health Status Index:", 55, currentY + 14);
    doc.fillColor(darkTextColor).fontSize(16).text(`${data.welfareStatusIndex}/100`, 310, currentY + 12);
    doc.fontSize(9).font("Helvetica").fillColor("#4B5563").text("Ethical Preservation Protocol Active: Humane handling & slaughter prevention priority.", 55, currentY + 38);

    currentY += 75;

    // Immediate Interventions
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Immediate Clinical & Welfare Interventions", 40, currentY);
    currentY += 18;

    if (Array.isArray(data.immediateInterventions)) {
      data.immediateInterventions.forEach((item: any) => {
        if (currentY > 700) {
          doc.addPage();
          currentY = 40;
        }
        const isCrit = item.priority === "CRITICAL";
        doc.rect(40, currentY, 515, 36).fill(isCrit ? "#FEE2E2" : "#F0FDF4");
        doc.fillColor(isCrit ? "#B91C1C" : "#047857").fontSize(9).font("Helvetica-Bold").text(`[${item.priority}] ${item.actionItem}`, 50, currentY + 6);
        doc.fillColor(darkTextColor).fontSize(8.5).font("Helvetica").text(item.implementationDetails, 50, currentY + 18, { width: 495 });
        currentY += 42;
      });
    }

    currentY += 10;
    if (currentY > 690) {
      doc.addPage();
      currentY = 40;
    }

    // Sustainable Economic Pathways (slaughter-prevention monetization)
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Sustainable Economic & Bio-Product Pathways", 40, currentY);
    currentY += 18;

    if (Array.isArray(data.sustainableEconomicPathways)) {
      data.sustainableEconomicPathways.forEach((p: any) => {
        if (currentY > 680) {
          doc.addPage();
          currentY = 40;
        }
        doc.rect(40, currentY, 515, 48).fillAndStroke("#F0FDF4", "#A7F3D0");
        doc.fillColor(primaryColor).fontSize(10).font("Helvetica-Bold").text(p.pathwayName, 50, currentY + 6);
        doc.fillColor("#065F46").fontSize(8.5).text(`Difficulty: ${p.implementationDifficulty}  |  Projected Returns: ${p.projectedMonthlyIncomeOrSavings}`, 240, currentY + 6);
        if (Array.isArray(p.actionSteps)) {
          doc.fillColor(darkTextColor).fontSize(8).font("Helvetica").text(`Key Steps: ${p.actionSteps.slice(0, 2).join("; ")}`, 50, currentY + 22, { width: 495 });
        }
        currentY += 54;
      });
    }

    currentY += 10;
    if (currentY > 690) {
      doc.addPage();
      currentY = 40;
    }

    // Nutrition & Shelter
    doc.fillColor(secondaryColor).fontSize(12).font("Helvetica-Bold").text("Nutritional Optimization & Ethno-Veterinary Care", 40, currentY);
    currentY += 18;

    doc.rect(40, currentY, 515, 52).fill("#F9FAFB");
    doc.fillColor(darkTextColor).fontSize(8.5).font("Helvetica");
    doc.text(`Ration Balancing: ${data.nutritionalOptimization?.rationBalancingPlan || "N/A"}`, 50, currentY + 6, { width: 495 });
    doc.fillColor("#047857").text(`Local Substitutes: ${(data.nutritionalOptimization?.lowCostLocalFeedSubstitutes || []).slice(0, 2).join(", ")}`, 50, currentY + 32, { width: 495 });

    currentY += 60;
  }

  // Footer on all pages
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.rect(40, 800, 515, 1).fill("#E5E7EB");
    doc.fillColor("#9CA3AF").fontSize(8).text(
      `AgriGenius Enterprise Agronomy & Cattle Welfare | Page ${i + 1} of ${range.count}`,
      40,
      808,
      { align: "center", width: 515 }
    );
  }

  doc.end();
};
