import { Request, Response, NextFunction } from "express";
import { query } from "../config/db";

export const getSanctuaries = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const region = req.query.state_region as string;
    const search = req.query.search as string;

    let sql = "SELECT * FROM cattle_sanctuaries WHERE 1=1";
    const params: any[] = [];

    if (region && region.trim()) {
      params.push(`%${region.trim()}%`);
      sql += ` AND state_region ILIKE $${params.length}`;
    }

    if (search && search.trim()) {
      params.push(`%${search.trim()}%`);
      sql += ` AND (name ILIKE $${params.length} OR services_offered::text ILIKE $${params.length})`;
    }

    sql += " ORDER BY name ASC";

    const result = await query(sql, params);

    res.status(200).json({
      success: true,
      count: result.rowCount,
      data: result.rows,
    });
  } catch (err) {
    next(err);
  }
};
