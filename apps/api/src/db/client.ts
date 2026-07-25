import pg from "pg";

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    const isSSL = process.env.NODE_ENV === "production" || url.includes("render.com") || url.includes("sslmode=require");
    pool = new pg.Pool({
      connectionString: url,
      max: 10,
      ssl: isSSL ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}

export async function dbHealthy(): Promise<boolean> {
  try {
    await getPool().query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
