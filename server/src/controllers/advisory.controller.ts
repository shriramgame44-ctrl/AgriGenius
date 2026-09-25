import { Request, Response, NextFunction } from "express";
import { query } from "../config/db";
import {
  CropInputZodSchema,
  LivestockInputZodSchema,
} from "../validations/advisory.validation";
import {
  generateCropAdvisory,
  generateLivestockAdvisory,
} from "../services/gemini.service";
import { generateAdvisoryPdf } from "../services/pdf.service";

const formatRecord = (row: any) => {
  if (!row) return row;
  return {
    ...row,
    input_parameters:
      typeof row.input_parameters === "string"
        ? JSON.parse(row.input_parameters)
        : row.input_parameters,
    advisory_response:
      typeof row.advisory_response === "string"
        ? JSON.parse(row.advisory_response)
        : row.advisory_response,
  };
};

export const createCropAdvisory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const validatedInput = CropInputZodSchema.parse(req.body);

    console.log(`[Advisory] Generating Crop Advisory for user ${req.user.id}...`);
    const advisoryResponse = await generateCropAdvisory(validatedInput);

    // Calculate ROI percentage
    const cost = advisoryResponse.economicForecast.estimatedCostPerUnitArea || 1;
    const netReturn = advisoryResponse.economicForecast.estimatedNetReturn || 0;
    const estimatedRoi = parseFloat(((netReturn / cost) * 100).toFixed(2));

    const title = `${advisoryResponse.recommendedCrop} Advisory (${validatedInput.region} - ${validatedInput.season})`;

    // Save to Database with user isolation
    const insertResult = await query(
      `INSERT INTO advisories (user_id, advisory_type, title, status, input_parameters, advisory_response, estimated_roi_percentage)
       VALUES ($1, 'CROP', $2, 'COMPLETED', $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        title,
        JSON.stringify(validatedInput),
        JSON.stringify(advisoryResponse),
        estimatedRoi,
      ]
    );

    const savedRecord = formatRecord(insertResult.rows[0]);

    res.status(201).json({
      success: true,
      message: "Crop Advisory generated and saved successfully.",
      data: savedRecord,
    });
  } catch (err) {
    next(err);
  }
};

export const createLivestockAdvisory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const validatedInput = LivestockInputZodSchema.parse(req.body);

    console.log(`[Advisory] Generating Cattle Welfare Advisory for user ${req.user.id}...`);
    const advisoryResponse = await generateLivestockAdvisory(validatedInput);

    const title = `Cattle Welfare & Preservation Plan (${validatedInput.bovineCategory} Herd: ${validatedInput.headCount} Head)`;

    // Estimate economic index from sustainable pathways
    const estimatedRoi = 15.5; // Benchmark sustainable value-add ROI

    const insertResult = await query(
      `INSERT INTO advisories (user_id, advisory_type, title, status, input_parameters, advisory_response, estimated_roi_percentage)
       VALUES ($1, 'LIVESTOCK_WELFARE', $2, 'COMPLETED', $3, $4, $5)
       RETURNING *`,
      [
        req.user.id,
        title,
        JSON.stringify(validatedInput),
        JSON.stringify(advisoryResponse),
        estimatedRoi,
      ]
    );

    const savedRecord = formatRecord(insertResult.rows[0]);

    res.status(201).json({
      success: true,
      message: "Cattle & Livestock Welfare Advisory generated successfully.",
      data: savedRecord,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserAdvisories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const offset = (page - 1) * limit;
    const typeFilter = req.query.type as string;

    let sql = "SELECT * FROM advisories WHERE user_id = $1";
    const params: any[] = [req.user.id];

    if (typeFilter && ["CROP", "LIVESTOCK_WELFARE"].includes(typeFilter)) {
      params.push(typeFilter);
      sql += ` AND advisory_type = $${params.length}`;
    }

    sql += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    const result = await query(sql, params);

    // Get total count
    let countSql = "SELECT COUNT(*) as total FROM advisories WHERE user_id = $1";
    const countParams: any[] = [req.user.id];
    if (typeFilter && ["CROP", "LIVESTOCK_WELFARE"].includes(typeFilter)) {
      countParams.push(typeFilter);
      countSql += ` AND advisory_type = $${countParams.length}`;
    }
    const countRes = await query(countSql, countParams);
    const totalRecords = parseInt(countRes.rows[0]?.total || "0", 10);

    res.status(200).json({
      success: true,
      data: result.rows.map(formatRecord),
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getAdvisoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const { id } = req.params;

    // Strict row-level security: enforce user_id match
    const result = await query(
      "SELECT * FROM advisories WHERE id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Advisory report not found or access denied.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: formatRecord(result.rows[0]),
    });
  } catch (err) {
    next(err);
  }
};

export const deleteAdvisory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const { id } = req.params;

    const result = await query(
      "DELETE FROM advisories WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Advisory report not found or access denied.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Advisory record deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

export const downloadAdvisoryPdf = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Authentication required." });
      return;
    }

    const { id } = req.params;

    const result = await query(
      `SELECT a.*, u.full_name, u.farm_name 
       FROM advisories a 
       JOIN users u ON a.user_id = u.id 
       WHERE a.id = $1 AND a.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Advisory report not found or access denied.",
      });
      return;
    }

    const record = result.rows[0];
    generateAdvisoryPdf(record, res);
  } catch (err) {
    next(err);
  }
};
