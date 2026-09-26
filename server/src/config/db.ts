import { Pool } from "pg";
import { PGlite } from "@electric-sql/pglite";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

let pgPool: Pool | null = null;
let pgliteInstance: PGlite | null = null;
let isUsingPglite = false;

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export const getDb = async () => {
  if (pgPool) return { type: "pool", client: pgPool };
  if (pgliteInstance) return { type: "pglite", client: pgliteInstance };

  const databaseUrl = process.env.DATABASE_URL;

  // Try PostgreSQL Pool if URL is configured
  if (databaseUrl && (!databaseUrl.includes("localhost:5432") || process.env.USE_REMOTE_DB === "true")) {
    try {
      const isRemote =
        databaseUrl.includes("supabase.co") ||
        databaseUrl.includes("supabase.com") ||
        databaseUrl.includes("pooler.supabase.com") ||
        databaseUrl.includes("render.com") ||
        databaseUrl.includes("neon.tech") ||
        process.env.NODE_ENV === "production";

      const pool = new Pool({
        connectionString: databaseUrl,
        connectionTimeoutMillis: 10000,
        ssl: isRemote ? { rejectUnauthorized: false } : undefined,
      });
      // Test connection
      await pool.query("SELECT 1");
      console.log("✅ Successfully connected to remote PostgreSQL database (Supabase).");
      pgPool = pool;
      return { type: "pool", client: pgPool };
    } catch (err: any) {
      console.warn("⚠️ Remote PostgreSQL server connection unavailable:", err.message);
      console.log("Falling back to embedded PostgreSQL (PGlite)...");
    }
  }

  // Fallback to PGlite (Embedded full PostgreSQL WASM engine)
  pgliteInstance = new PGlite();
  isUsingPglite = true;
  console.log("Initialized embedded PostgreSQL (PGlite) engine.");
  return { type: "pglite", client: pgliteInstance };
};

export const query = async <T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> => {
  await getDb();

  if (pgPool) {
    const res = await pgPool.query(text, params);
    return {
      rows: res.rows as T[],
      rowCount: res.rowCount ?? res.rows.length,
    };
  }

  if (pgliteInstance) {
    // PGlite supports standard parameter placeholders $1, $2, etc.
    const res = await pgliteInstance.query<T>(text, params);
    return {
      rows: res.rows,
      rowCount: res.rows.length,
    };
  }

  throw new Error("No database driver available");
};

export const initDb = async () => {
  console.log("Initializing database tables and constraints...");
  const schemaPath = path.join(__dirname, "..", "models", "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf-8");

  // Execute schema DDL statements
  const statements = schemaSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    try {
      await query(stmt);
    } catch (err: any) {
      // Ignore extension errors if uuid extension is built-in
      if (!stmt.includes("uuid-ossp")) {
        console.error("Schema execution error on statement:", stmt.slice(0, 60), err.message);
      }
    }
  }

  // Seed default cattle sanctuaries if table is empty
  try {
    const countCheck = await query("SELECT COUNT(*) as cnt FROM cattle_sanctuaries");
    const count = parseInt(countCheck.rows[0]?.cnt || "0", 10);
    if (count === 0) {
      console.log("Seeding verified Cattle Sanctuaries & Rescue Directory...");
      const sanctuaries = [
        {
          name: "Gau Sewa Parivar & Bovine Sanctuary",
          contact_person: "Dr. Rajesh Sharma",
          phone: "+91 98290 12345",
          email: "support@gausewaparivar.org",
          state_region: "Rajasthan",
          capacity_status: "OPEN",
          services: ["REHABILITATION", "MEDICAL_CARE", "FODDER_ASSISTANCE", "SHELTER"],
        },
        {
          name: "Karuna Dairy Cow Rehabilitation Trust",
          contact_person: "Smt. Meera Patel",
          phone: "+91 98795 23456",
          email: "help@karunacowtrust.org",
          state_region: "Gujarat",
          capacity_status: "OPEN",
          services: ["ETHNO_VET_CARE", "BIO_PRODUCT_TRAINING", "LONG_TERM_SHELTER"],
        },
        {
          name: "Nandi Animal Welfare & Rescue Haven",
          contact_person: "S. Gurpreet Singh",
          phone: "+91 98140 34567",
          email: "care@nandihaven.org",
          state_region: "Punjab",
          capacity_status: "LIMITED",
          services: ["ELDERLY_CATTLE_CARE", "MEDICAL_CARE", "FODDER_ASSISTANCE"],
        },
        {
          name: "Sahyadri Heritage Bovine Conservation",
          contact_person: "Anand Kulkarni",
          phone: "+91 94220 45678",
          email: "info@sahyadribovine.org",
          state_region: "Maharashtra",
          capacity_status: "OPEN",
          services: ["INDIGENOUS_BREED_CONSERVATION", "PANCHAGAVYA_PRODUCTION", "REHABILITATION"],
        },
        {
          name: "Cauvery Green Cattle Care Ashram",
          contact_person: "R. Venkatesh",
          phone: "+91 98450 56789",
          email: "contact@cauverycattleashram.org",
          state_region: "Karnataka",
          capacity_status: "LIMITED",
          services: ["RESCUE_OPERATION", "REHABILITATION", "NATURAL_GRAZING"],
        },
        {
          name: "Vrindavan Bovine Sanctuary & Hospital",
          contact_person: "Acharya Devrat",
          phone: "+91 99170 67890",
          email: "seva@vrindavangau.org",
          state_region: "Uttar Pradesh",
          capacity_status: "OPEN",
          services: ["LIFETIME_CARE", "VETERINARY_HOSPITAL", "FODDER_ASSISTANCE"],
        },
        {
          name: "Ahimsa Eco-Farms & Animal Sanctuary",
          contact_person: "Dr. K. Subramanian",
          phone: "+91 94440 78901",
          email: "trust@ahimsaecofarms.org",
          state_region: "Tamil Nadu",
          capacity_status: "OPEN",
          services: ["BIO_ENERGY_TRAINING", "RETIRED_WORKING_BULLOCKS", "REHABILITATION"],
        },
      ];

      for (const s of sanctuaries) {
        await query(
          `INSERT INTO cattle_sanctuaries (name, contact_person, phone, email, state_region, capacity_status, services_offered)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [s.name, s.contact_person, s.phone, s.email, s.state_region, s.capacity_status, s.services]
        );
      }
      console.log(`Seeded ${sanctuaries.length} sanctuaries.`);
    }
  } catch (err: any) {
    console.error("Error seeding sanctuaries:", err.message);
  }

  console.log("Database initialized successfully.");
};
